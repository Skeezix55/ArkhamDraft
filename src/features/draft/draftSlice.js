import { createSlice } from '@reduxjs/toolkit'

import { reset, beginDraft, endDraft, changeSetting, calculateFilteredCount } from '../settings/settingsSlice'
import { mergeTaboo } from '../data/dataSlice'

import { extraDeckRequirements } from '../../data/CardFilter'
import { costWithModifiers, fillDraft, isCardLegalBurnOption } from '../../draft/DrawDraft'
import { initDeckModifiers, addDeckModifier } from '../../draft/Modifiers'
import DraftPhases, { isLevel0Build, isLevel0Upgrade, isUpgrade } from '../../data/DraftPhases'

const initialState = {
    cardList: [],
    deckList: [],
    removedList: [],
    mergedList: [],
    draftPool: [],
    deckName: '',
    phase: 1,
    progress: 0,
    upgradeProgress: 0,
    filteredCount: 0,
    draftIndex: -1,
    buildXPList: [],
    deckModifiers: [],
    showDeckOptions: true,
    insufficientDraftOptions: false,
    selectedDraftCard: null,
    level0Swaps: [ // array so sorted, but makes updating count stupid
    ],
    level0Adds: [ // array so sorted, but makes updating count stupid
        { name: 'Exile', count: 0, drafted: 0 },
        { name: 'Adaptable', count: 0, drafted: 0 },
        { name: 'Versatile', count: 0, drafted: 0, versatileCount: 0, versatileDrafted: 0 },
        { name: 'Ancestral Knowledge', count: 0, drafted: 0 },
        { name: 'Underworld Market', count: 0, drafted: 0 },
        { name: 'Removed', count: 0, drafted: 0 },
        { name: 'Requirement (Deck size)', count: 0, drafted: 0 },
        { name: 'Requirement (Class)', count: 0, drafted: 0 },
        { name: 'Requirement (Skills)', count: 0, drafted: 0 },
        { name: 'Requirement (Insights)', count: 0, drafted: 0 }
    ],
    currentLevel0Name: '',
    level0Requirements: [
    ]
}
const draftSlice = createSlice({
    name: 'draft',
    initialState,
    reducers: {
        changePhase(state, action) {
            state.phase = action.payload
        },
        addToDraftPool(state, action) {
            state.draftPool.push(action.payload)
        },
        clearDraftPool(state, action) {
            state.draftPool = []
        },
        addToCardList(state, action) {
            let card = action.payload.card
            let addCount = action.payload.count

            addCardToList(card, state.cardList, addCount)

            var list = []
            list = mergeLists(list, state.cardList)
            mergeLists(list, state.deckList)
            state.mergedList = removeList(list, state.removedList)
        },
        clearCardList(state, action) {
            state.cardList = []

            var list = []
            list = mergeLists(list, state.deckList)
            state.mergedList = removeList(list, state.removedList)
        },
        addToRemovedList(state, action) {
            let card = action.payload.card
            let addCount = action.payload.count

            addCardToList(card, state.removedList, addCount)

            var list = []
            list = mergeLists(list, state.cardList)
            list = mergeLists(list, state.deckList)
            state.mergedList = removeList(list, state.removedList)
        },
        removeFromRemovedList(state, action) {
            let card = action.payload.card
            removeCardFromList(card, state.removedList, 1)

            var list = []
            list = mergeLists(list, state.cardList)
            mergeLists(list, state.deckList)
            state.mergedList = removeList(list, state.removedList)
        },
        clearRemovedList(state, action) {
            state.removedList = []

            var list = []
            list = mergeLists(list, state.cardList)
            state.mergedList = mergeLists(list, state.deckList)
        },
        setDeckList(state, action) {
            state.deckList = action.payload

            var list = []
            list = mergeLists(list, state.cardList)
            mergeLists(list, state.deckList)
            state.mergedList = removeList(list, state.removedList)
        },
        clearDeckList(state, action) {
            state.deckList = []

            var list = []
            list = mergeLists(list, state.cardList)
            state.mergedList = removeList(list, state.removedList)
        },
        changeDeckName(state, action) {
            state.deckName = action.payload
        },
        changeProgress(state, action) {
            state.progress = action.payload
        },
        changeUpgradeProgress(state, action) {
            state.upgradeProgress = action.payload
        },
        changeIndex(state, action) {
            state.draftIndex = action.payload
        },
        addToBuildXPList(state, action) {
            state.buildXPList.push(action.payload)
        },
        clearBuildXPList(state, action) {
            state.buildXPList = []
        },
        changeShowDeckOptions(state, action) {
            state.showDeckOptions = action.payload
        },
        changeLevel0: { 
            // addDrafted is used when requirements are changed during an upgrade draft 
            reducer(state, action) {
                const swapObjects = state.level0Swaps.filter(item => item.name === action.payload.name)
                if (swapObjects.length > 0) {
                    swapObjects[0].count = action.payload.count
                    if (action.payload.addDrafted) swapObjects[0].count += swapObjects[0].drafted
                }

                const addObjects = state.level0Adds.filter(item => item.name === action.payload.name)           
                if (addObjects.length > 0) {
                    if (action.payload.name === 'Versatile') {
                        addObjects[0].count = action.payload.count - 1
                        addObjects[0].versatileCount = action.payload.count / 5
                    }
                    else {
                        addObjects[0].count = action.payload.count
                    }

                    if (action.payload.addDrafted) addObjects[0].count += addObjects[0].drafted
                }
            },
            prepare(name, count, addDrafted) {
                return { payload: { name: name, count: count, addDrafted: addDrafted }}
            }
        },
        addLevel0: {
            reducer(state, action) {
                const swapObjects = state.level0Swaps.filter(item => item.name === action.payload.name)
                
                if (swapObjects.length > 0) {
                    swapObjects[0].count = swapObjects[0].count + action.payload.count
                }

                const addObjects = state.level0Adds.filter(item => item.name === action.payload.name)

                if (addObjects.length > 0) {
                    if (action.payload.name === 'Versatile') {
                        addObjects[0].count = addObjects[0].count + action.payload.count - 1
                        addObjects[0].versatileCount = addObjects[0].versatileCount + 1
                    }
                    else {
                        addObjects[0].count = addObjects[0].count + action.payload.count
                    }
                }
            },
            prepare(name, count) {
                return { payload: { name: name, count: count }}
            }
        },
        draftLevel0: {
            reducer(state, action) {
                const swapObjects = state.level0Swaps.filter(item => item.name === action.payload.name)
    
                if (swapObjects.length > 0) {
                    swapObjects[0].drafted = swapObjects[0].drafted + action.payload.count
                }

                const addObjects = state.level0Adds.filter(item => item.name === action.payload.name)
                
                if (addObjects.length > 0) {
                    addObjects[0].drafted = addObjects[0].drafted + action.payload.count
                }   
                
                // find current level 0 type
                for (let i = 0; i < state.level0Adds.length; i++) {
                    if (state.level0Adds[i].count > state.level0Adds[i].drafted) {
                        state.currentLevel0Name = state.level0Adds[i].name
                        break
                    }
                }
            },
            prepare(name, count) {
                return { payload: { name: name, count: count }}
            }
        },
        setLevel0Requirements(state, action) {
            state.level0Requirements = action.payload
        },
        updateCurrentLevel0Name(state, action) {
            // find current level 0 type
            for (let i = 0; i < state.level0Adds.length; i++) {
                if (state.level0Adds[i].count > state.level0Adds[i].drafted) {
                    state.currentLevel0Name = state.level0Adds[i].name
                    break
                }
            }            
        },
        draftVersatile(state, action) {
            const countObject = state.level0Adds.filter(item => item.name === 'Versatile')[0]
            countObject.versatileDrafted = countObject.versatileDrafted + 1
        },
        setDeckModifiers(state, action) {
            state.deckModifiers = action.payload
        },
        setInsufficientOptions(state, action) {
            state.insufficientDraftOptions = action.payload
        },
        changeUpgradeOption(state, action) {
            state.draftPool[action.payload.index].selectedUpgrade = action.payload.value
            state.draftPool[action.payload.index].cardModifiers = action.payload.modifiers
            
            const cost = costWithModifiers(state.draftPool[action.payload.index], action.payload.modifiers, action.payload.value)

            state.draftPool[action.payload.index].xpcost = cost
        },
        changeDraftPoolProperty: {
            reducer(state, action) {
                state.draftPool[action.payload.index][action.payload.property] = action.payload.value
            },
            prepare(property, index, value) {
                return { payload: { property: property, index: index, value: value }}
            }  
        },
        expandModifiers(state, action) {
            state.draftPool[action.payload].expandedModifiers = 1
        },
        minimizeModifiers(state, action) {
            state.draftPool[action.payload].expandedModifiers = 0
        },
        holdModifiers(state, action) {
            state.draftPool[action.payload].expandedModifiers = 2
        },
        selectDraftCard(state, action) {
            state.selectedDraftCard = action.payload
        },
        changeLimit(state, action) {
            let removeIndex = -1

            state.deckModifiers.forEach((item, index) => {
                if (item.name === action.payload.name) {
                    if (item.limit > 0) {
                        if (item.name === 'D\u00e9j\u00e0 Vu') {
                            // only if we are saving 2xp; if only 1, don't mess with remainder, as you want to keep the uses on the 2 Deja Vu as even as possible
                            if (item.remainder && item.remainder > 0 && item.limit - action.payload.limit > 1) {
                                // remove the difference from remainder as well
                                item.remainder -= 1
                                if (item.remainder <= 0) {
                                    item.remainder = null
                                    item.modifier = -1
                                }
                            }

                            if (action.payload.limit === 1) item.modifier = -1
                            else if (action.payload.limit === 0) item.modifier = 0
                        }

                        item.limit = action.payload.limit
                        if (item.limit === 0) removeIndex = index
                    }
                }

                if (action.payload.dejavu && item.name === 'D\u00e9j\u00e0 Vu') {
                    item.codes[action.payload.dejavu] -= 1
                }
            })

            if (removeIndex >= 0) state.deckModifiers.splice(removeIndex, 1)
        }
    },
    extraReducers: (builder) => {
        builder.addCase(reset, (state, action) => {
            return { ...initialState }
        })
        .addCase(changeSetting, (state, action) => {
            if (action.payload.setting === 'ExileCheckbox') {
                let inc = 1
                const exileCode = action.payload.id.substring(0, 5)

                if (exileCode === '08076') {    // burn after reading
                    inc = 2
                }

                const countObject = state.level0Adds.filter(item => item.name === 'Exile')[0]
                if (action.payload.value) countObject.count += inc
                else countObject.count -= inc
            }

            if (action.payload.setting === 'RemovedCards') {
                const countObject = state.level0Adds.filter(item => item.name === 'Removed')[0]
                if (action.payload.value) countObject.count = parseInt(action.payload.value)
            }
        })
        .addCase(endDraft, (state, action) => {
            if (state.phase === DraftPhases.UpgradeLevel0SwapPhase) {
                state.level0Swaps.forEach( item => {
                    item.count -= item.drafted
                    item.drafted = 0
                })
            }
            else if (state.phase === DraftPhases.UpgradeLevel0AddPhase) {
                state.level0Adds.forEach( item => {
                    item.count -= item.drafted
                    item.drafted = 0

                    if (item.name === 'Versatile') {
                        item.versatileCount -= item.versatileDrafted
                        item.versatileDrafted = 0
                    }
                })
            }
        })
    }
/*
    extraReducers: (builder) => {
        builder.addCase(reset, (state, action) => {
            return { ...initialState }
        }),
        builder.addCase(changeSetting, (state, action) => {
            if (action.payload.setting === 'ExileCheckbox') {
                let inc = 1
                const exileCode = action.payload.id.substring(0, 5)

                if (exileCode === '08076') {    // burn after reading
                    inc = 2
                }

                const countObject = state.level0Adds.filter(item => item.name === 'Exile')[0]
                if (action.payload.value) countObject.count += inc
                else countObject.count -= inc
            }

            if (action.payload.setting === 'RemovedCards') {
                const countObject = state.level0Adds.filter(item => item.name === 'Removed')[0]
                if (action.payload.value) countObject.count = parseInt(action.payload.value)
            }
        }),
        builder.addCase(endDraft, (state, action) => {
            if (state.phase === DraftPhases.UpgradeLevel0SwapPhase) {
                state.level0Swaps.forEach( item => {
                    item.count -= item.drafted
                    item.drafted = 0
                })
            }
            else if (state.phase === DraftPhases.UpgradeLevel0AddPhase) {
                state.level0Adds.forEach( item => {
                    item.count -= item.drafted
                    item.drafted = 0

                    if (item.name === 'Versatile') {
                        item.versatileCount -= item.versatileDrafted
                        item.versatileDrafted = 0
                    }
                })
            }
        })
//        'settings/reset': (state, action) => {
//            return { ...initialState }
//        },
/-*
        'settings/changeSetting': (state, action) => {
            if (action.payload.setting === 'ExileCheckbox') {
                let inc = 1
            const exileCode = action.payload.id.substring(0, 5)

                if (exileCode === '08076') {    // burn after reading
                    inc = 2
                }

                const countObject = state.level0Adds.filter(item => item.name === 'Exile')[0]
                if (action.payload.value) countObject.count += inc
                else countObject.count -= inc
            }

            if (action.payload.setting === 'RemovedCards') {
                const countObject = state.level0Adds.filter(item => item.name === 'Removed')[0]
                if (action.payload.value) countObject.count = parseInt(action.payload.value)
            }
        },
        'settings/endDraft': (state, action) => {
            if (state.phase === DraftPhases.UpgradeLevel0SwapPhase) {
                state.level0Swaps.forEach( item => {
                    item.count -= item.drafted
                    item.drafted = 0
                })
            }
            else if (state.phase === DraftPhases.UpgradeLevel0AddPhase) {
                state.level0Adds.forEach( item => {
                    item.count -= item.drafted
                    item.drafted = 0

                    if (item.name === 'Versatile') {
                        item.versatileCount -= item.versatileDrafted
                        item.versatileDrafted = 0
                    }
                })
            }
        }
*-/
    }
*/
})

function addCardToList(card, list, addCount) {
    const code = card.key

    const existingIndex = list.length > 0 ? list.findIndex(item => item.key === code) : -1

    if (existingIndex >= 0) {
        list[existingIndex].count += addCount
        list[existingIndex].xpcost += card.xpcost

        if (list[existingIndex].count > card.deck_limit) list[existingIndex].count = card.deck_limit
    }
    else {
        list.push({ ...card, count: addCount })
//        list.push(listCardFromDraftData(card, addCount))
    }

    return list
}

function removeCardFromList(card, list, removeCount) {
    const existingIndex = list.length > 0 ? list.findIndex(item => item.key === card.key) : -1

    if (existingIndex >= 0) {
        if (removeCount >= list[existingIndex].count)
            list.splice(existingIndex, 1)
        else 
            list[existingIndex].count -= removeCount
    }

    return list
}

function startDraft(phase) {
    return function startDraftThunk(dispatch, getState) {
        dispatch(changePhase(phase))

        var state = getState()

        dispatch(mergeTaboo(state.settings.selectedTaboo))

        // refresh
        state = getState()

        // recalculate filteredReseach, mainly for Versatile
        dispatch(calculateFilteredCount)
        dispatch(clearBuildXPList())
        
        if (isLevel0Build(state.draft.phase)) {
            if ((state.settings.investigator === 'Father Mateo' && !state.settings.parallel) || (state.settings.investigator === 'Roland Banks' && state.settings.parallel)) {
                dispatch(addToBuildXPList({ name: state.settings.investigator + (state.settings.parallel ? ' (Parallel)' : ''), value: 5 }))
            }
        }
        else if (state.draft.phase === DraftPhases.UpgradePhase) {
            dispatch(changeProgress(state.draft.upgradeProgress))
        }
        else if (state.draft.phase === DraftPhases.BuildUpgradePhase) {
            // test whether to do a level 0 draft first
            const xpTotal = state.draft.buildXPList.reduce((accumulator, a) => accumulator + a.value, 0)

            dispatch(changeProgress(0))
            dispatch(changeSetting('DraftXP', xpTotal))
        }
        else if (isLevel0Upgrade(state.draft.phase)) {
            dispatch(updateCurrentLevel0Name())
        }

        // only do this the first time, otherwise things get doubled up
        if (state.draft.deckModifiers.length < 1) dispatch(initDeckModifiers())
        dispatch(beginDraft())
        dispatch(fillDraft())
    }
}

function advanceDraft(doneClicked) {
    return function advanceDraftThunk(dispatch, getState) {
        const state = getState()

        switch (state.draft.phase) {
            case DraftPhases.UpgradeLevel0SwapPhase:
            case DraftPhases.UpgradeLevel0AddPhase:
            case DraftPhases.VersatilePhase:
            case DraftPhases.BuildUpgradePhase:
                dispatch(changeProgress(0))
                dispatch(changeShowDeckOptions(false))

                // don't change main draft complete status
                dispatch(endDraft(state.settings.complete))
                break
            case DraftPhases.UpgradePhase:
                dispatch(changeUpgradeProgress(state.draft.progress))
                dispatch(changeProgress(0))
                dispatch(changeShowDeckOptions(false))

                dispatch(endDraft(!doneClicked))
                break
            default:
                dispatch(changeProgress(0))
                dispatch(endDraft(true))
                break
        }
//okay, it's good, just need to figure out how to handle phase...
        if (isLevel0Upgrade(state.draft.phase) || isUpgrade(state.draft.phase)) {
            updateDeckRequirements(dispatch, getState)
/*
            // check additional requirements needed
            const requirementOptions = extraDeckRequirements({
                investigatorData: state.settings.investigatorData,
                mergedList: state.draft.mergedList,
                deckSize: state.settings.deckSize,
                phase: state.draft.phase,
                level0Swaps: state.draft.level0Swaps,
                level0Adds: state.draft.level0Adds
            })

            // translate requirements into level0Requirements array
            const requirements = requirementOptions.map( item => {
                return { name: item.name,
                    count: item.requirement,
                    drafted: item.count
                }
            })

            dispatch(setLevel0Requirements(requirements))

            var totalLevel0Drafts = state.draft.level0Swaps.reduce((acc, a) => acc + a.count - a.drafted, 0)
            totalLevel0Drafts += state.draft.level0Adds.reduce((acc, a) => acc += a.count - a.drafted, 0)

            for (let i = 0; i < requirementOptions.length; i++) {
                const totalCount = requirementOptions[i].count + totalLevel0Drafts

                if (totalCount < requirementOptions[i].requirement) {
                    if (requirementOptions[i].name.includes('Faction')) {
                        dispatch(changeLevel0('Requirement (Class)', requirementOptions[i].requirement - totalCount))
                    }
                    else {
                        dispatch(changeLevel0('Requirement (' + requirementOptions[i].name + ')', requirementOptions[i].requirement - totalCount))
                    }
                }
            }
*/
        }
    }
}

export function updateDeckRequirements(dispatch, getState, phaseOverride) {
    const state = getState()

    const phase = phaseOverride ? phaseOverride : state.draft.phase

    // check additional requirements needed
    const requirementOptions = extraDeckRequirements({
        investigatorData: state.settings.investigatorData,
        classChoices: state.settings.classChoices,
        mergedList: state.draft.mergedList,
        deckSize: state.settings.deckSize,
        phase: phase,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    // translate requirements into level0Requirements array
    const requirements = requirementOptions.filter( item => item.name.length > 0 && item.count < item.requirement ).map( item => {
        return { name: item.name,
            count: item.requirement,
            drafted: item.count
        }
    })

    dispatch(setLevel0Requirements(requirements))

    // non-requirement cards
    var totalLevel0Drafts = state.draft.level0Swaps.filter(item => {
        return !item.name.includes('Requirement (')
    }).reduce((acc, a) => acc + a.count - a.drafted, 0)
    totalLevel0Drafts += state.draft.level0Adds.filter(item => {
        return !item.name.includes('Requirement (')
    }).reduce((acc, a) => acc += a.count - a.drafted, 0)

    for (let i = 0; i < requirementOptions.length; i++) {
        if (!requirementOptions[i].name.includes('Deck size')) {
            const totalCount = requirementOptions[i].count

            if (requirementOptions[i].name.includes('Class')) {
                dispatch(changeLevel0('Requirement (Class)', requirementOptions[i].remaining, true))
                totalLevel0Drafts += requirementOptions[i].remaining
            }
            else if (requirementOptions[i].name.length > 0) {
                if (requirementOptions[i].requirement > totalCount) {
                    dispatch(changeLevel0('Requirement (' + requirementOptions[i].name + ')', requirementOptions[i].requirement - totalCount, true))
                    totalLevel0Drafts += requirementOptions[i].requirement - totalCount
                }
            }
        }
    }

    for (let i = 0; i < requirementOptions.length; i++) {
        if (requirementOptions[i].name.includes('Deck size')) {
            const totalCount = requirementOptions[i].count + totalLevel0Drafts
            if (requirementOptions[i].requirement > totalCount) {
                dispatch(changeLevel0('Requirement (Deck size)', requirementOptions[i].requirement - totalCount, true))
            }
            else {
                dispatch(changeLevel0('Requirement (Deck size)', 0, true))
            }
        }
    }
}

function mergeLists(list1, list2) {
    list2.forEach( item2 => {
        const matchingItems = list1.filter( item1 => {
            return item1.key === item2.key 
        })

        if (matchingItems.length > 0) matchingItems[0].count += item2.count
        else list1.push( {...item2} )
    })

    return list1
}

function removeList(list1, list2) {
    list2.forEach( item2 => {
        const matchingItems = list1.filter( item1 => {
            return item1.key === item2.key 
        })

        if (matchingItems.length > 0) matchingItems[0].count -= item2.count
    })

    list1 = list1.filter( item => {
        return item.count > 0
    })

    return list1
}

function updateExileRemoval(exileCode, checked, burnedCode) {
    return function updateExileRemovalThunk(dispatch, getState) {
        const state = getState()

        if (checked) {
            const exileCards = state.draft.mergedList.filter( card => card.key === exileCode )
            const burnedCards = burnedCode ?
                state.draft.mergedList.filter( card => card.key === burnedCode) : null

                var updateBurn1 = false
            var updateBurn2 = false

            if (exileCards.length > 0) {
                dispatch(addToRemovedList({ card: exileCards[0], count: 1 }))
                
                if (state.settings.burnCards[0] === exileCode && exileCards[0].count === 1) {
                    updateBurn1 = true
                }
                if (state.settings.burnCards[1] === exileCode && exileCards[0].count === 1) {
                    updateBurn2 = true
                }
            }

            if (burnedCards && burnedCards.length > 0) {
                // somewhat convoluted, but....... when you turn BAR on, if the other one matches and isn't selected, and it isn't a legal option any more, clear the burn code
                // if the other burn is already turned on, any option that causes this should already have been filtered out
            
                if (burnedCards[0].count === 1) {
                    if (!state.settings.exileSelection['08076_1']) updateBurn1 = true
                    if (!state.settings.exileSelection['08076_2']) updateBurn2 = true
                }   

                dispatch(addToRemovedList({ card: burnedCards[0], count: 1 }))
            }

            if (updateBurn1) {
                const burnableCards = state.draft.mergedList.map( card => {
                    return isCardLegalBurnOption(card, state.settings.exileSelection, state.draft.deckList, state.settings.burnCards, 1) ? card : null
                }).filter( item => item !== null )
                
                if (burnableCards.length > 0) dispatch(changeSetting('BurnCard1', burnableCards[0].key))
            }
            if (updateBurn2) {
                const burnableCards = state.draft.mergedList.map( card => {
                    return isCardLegalBurnOption(card, state.settings.exileSelection, state.draft.deckList, state.settings.burnCards, 2) ? card : null
                }).filter( item => item !== null )
                
                if (burnableCards.length > 0) dispatch(changeSetting('BurnCard2', burnableCards[0].key))
            }
        }
        else {
            const exileCards = state.draft.removedList.filter( card => card.key === exileCode )
            const burnedCards = burnedCode ?
                state.draft.removedList.filter( card => card.key === burnedCode) : null

            if (exileCards.length > 0) {
                dispatch(removeFromRemovedList({ card: exileCards[0], count: 1 }))
            }

            if (burnedCards && burnedCards.length > 0) {
                dispatch(removeFromRemovedList({ card: burnedCards[0], count: 1 }))
            }
        }

        if (burnedCode) {
            const burnedCards = burnedCode ?
                state.draft.removedList.filter( card => card.key === burnedCode) : null

            // turn off checkbox and remove the card from the removed list if it was on
            if (burnedCards.length > 0) {
                const checkboxesNeeded = calculateNeededExileCheckboxes(burnedCode, state.settings.exileSelection, state.draft.deckList, state.settings.burnCards)

                for (let i = checkboxesNeeded; i < 2; i++) {
                    if (state.settings.exileSelection[burnedCode + '_' + (i+1)]) {
                        dispatch(changeSetting('ExileCheckbox' + burnedCode + '_' + (i+1), false))
                        dispatch(removeFromRemovedList({ card: burnedCards[0], count: 1 }))
                    }
                }
            }
        }
    }
}

function calculateNeededExileCheckboxes(exileCode, exileSelection, deckList, burnCards) {
    var count = deckList.reduce((acc, a) => {
        if (a.key === exileCode) return acc + a.count
        else return acc
    }, 0)

    for (let i = 0; i < 2; i++) {
        if (exileSelection['08076_' + (i+1)] && burnCards[i] === exileCode) count -= 1
    }

    return count
}

function updateUpgradeOption(index, value) {
    return function updateUpgradeOptionThunk(dispatch, getState) {
        const state = getState()

        const isUpgrade = (state.draft.draftPool[index].cardModifiers.filter(item => item.name === 'UpgradeOptions')[0].options[value].text !== 'None')
        var updatedModifiers = state.draft.draftPool[index].cardModifiers.filter(item => item.upgrade === undefined || item.upgrade === isUpgrade)
        const newModifiers = updatedModifiers.concat(state.draft.deckModifiers.filter(item => item.upgrade !== undefined && item.upgrade === isUpgrade))

        dispatch(changeUpgradeOption({ index: index, value: value, modifiers: newModifiers }))
    }
}

export const { changePhase, addToDraftPool, clearDraftPool, addToCardList, clearCardList, addToRemovedList,
    removeFromRemovedList, setDeckList, changeDeckName, setInsufficientOptions, changeShowDeckOptions,
    changeProgress, changeUpgradeProgress, changeIndex, addToBuildXPList, clearBuildXPList, changeLevel0, addLevel0,
    draftVersatile, draftLevel0, setLevel0Requirements, updateCurrentLevel0Name, setDeckModifiers, changeUpgradeOption, selectDraftCard, changeLimit, expandModifiers, minimizeModifiers, holdModifiers, changeDraftPoolProperty } = draftSlice.actions
export { startDraft, advanceDraft, initDeckModifiers, updateExileRemoval, updateUpgradeOption, addDeckModifier, calculateNeededExileCheckboxes }

export default draftSlice.reducer