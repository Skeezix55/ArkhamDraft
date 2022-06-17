import { createSlice } from '@reduxjs/toolkit'

import FilterCards, { filteredCount, filterResearch } from '../../data/CardFilter'
import DraftPhases from '../../data/DraftPhases'

const initialState = {
    investigatorData: null,
    investigator: 'Agnes Baker',
    parallel: false,
    secondaryClass: '',
    selectedDeckSize: '',
    traitChoice: {},
    selectedTaboo: 0,
    deckSize: '45',
    filteredCount: '0',
    filteredResearch: {},

    draftTab: "Build Deck",
    draftType: "draft",
    draftWeighting: 'medium',
    draftXP: 1,
    draftCount: [3, 3, 3, 3, 3, 3, 3, 3],
    draftCards: [10, 10, 10, 10, 10, 10, 10, 1],
    draftUseLimited: [true, true, true],
    myriadCount: 1,
    deckID: '',
    confirmDraft: false,
    excludeNormalVersatile: true,

    burnCards: [ '', '' ],
    exileSelection: {},
    researchSelection: {},
    otherUpgradeSettings: { GMM: '1' },
    removedCards: 0,

    drafting: false,
    complete: false,   
    imagesrc: null,
    imagepos: 0
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        changeInvestigator(state, action) {
            state.investigatorData = action.payload.data
            state.investigator = state.investigatorData.name
            state.parallel = action.payload.parallel

            const classOptions = state.investigatorData.deck_options.filter(item => item.name === 'Secondary Class')
            if (classOptions.length > 0) {
                state.secondaryClass = classOptions[0].faction_select[0]
            }   

            state.deckSize = state.investigatorData.deck_requirements.size
        
            const decksizeOptions = state.investigatorData.deck_options.filter(item => item.name === 'Deck Size')
            if (decksizeOptions.length > 0) {
                state.selectedDeckSize = decksizeOptions[0].deck_size_select[0]
            }
            else {
                state.selectedDeckSize = ''
            }

            const traitChoiceOptions = state.investigatorData.deck_options.filter(item => item.name === 'Trait Choice')
            if (traitChoiceOptions.length > 0) {
                state.traitChoice = traitChoiceOptions[0].option_select[0].name
            }
            else {
                state.traitChoice = ''
            }
        },
        changeSetting: {
            reducer(state, action) {
                switch (action.payload.setting) {
                    case 'SecondaryClass':
                        state.secondaryClass = action.payload.value
                        break
                    case 'DeckSize':
                        state.deckSize = parseInt(action.payload.value)
                        break
                    case 'SelectedDeckSize':
                        state.selectedDeckSize = parseInt(action.payload.value)
                        state.deckSize = parseInt(action.payload.value)
                        break
                    case 'TraitChoice':
                        // this assumes no other investigator based deck size shenanigans
                        state.traitChoice = action.payload.value

                        const traitOptions = state.investigatorData.deck_options.filter(item => item.name === 'Trait Choice')[0].option_select.filter(item => item.name === action.payload.value)
                        
                        if (traitOptions.length > 0 && traitOptions[0].size) {
                            state.deckSize = state.investigatorData.deck_requirements.size + traitOptions[0].size
                        }
                        break
                    case 'SelectedTaboo':
                        state.selectedTaboo = parseInt(action.payload.value)
                        break
                    case 'Tab':
                        state.draftTab = action.payload.value
                        if (action.payload.value === 'Upgrade' && state.draftType === 'phaseDraft') state.draftType = 'draft'
                        break
                    case 'DraftType':
                        state.draftType = action.payload.value
                        break
                    case 'MyriadCount':
                        state.myriadCount = parseInt(action.payload.value)
                        break
                    case 'DraftCount':
                        state.draftCount[action.payload.value.phase-1] = typeof action.payload.value.value === 'string' ? parseInt(action.payload.value.value) : action.payload.value.value
                        break
                    case 'DraftCards':
                        state.draftCards[action.payload.value.phase-1] = typeof action.payload.value.value === 'string' ? parseInt(action.payload.value.value) : action.payload.value.value
                        break
                    case 'FilteredCount':
                        state.filteredCount = action.payload.value
                        break
                    case 'FilteredResearch':
                        state.filteredResearch = action.payload.value
                        break
                    case 'DraftUseLimited':
                        state.draftUseLimited[action.payload.phase-1] = !state.draftUseLimited[action.payload.phase-1]
                        break
                    case 'DraftWeighting':
                        state.draftWeighting = action.payload.value
                        break
                    case 'DraftXP':
                        state.draftXP = parseInt(action.payload.value)
                        break
                    case 'DeckID':
                        state.deckID = action.payload.value
                        break
                    case 'BurnCard':
                        state.burnCards[action.payload.value.id] = action.payload.value.value
                        break
                    case 'ExileCheckbox':
                        state.exileSelection[action.payload.id] = action.payload.value
                        break
                    case 'ResearchCheckbox':
                        state.researchSelection[action.payload.value] = state.researchSelection[action.payload.value] ? false : true
                        break
                    case 'OtherUpgrade':
                        state.otherUpgradeSettings[action.payload.value.id] = action.payload.value.value
                        break
                    case 'RemovedCards':
                        state.removedCards = action.payload.value
                        break
                    case 'ExcludeNormalVersatile':
                        state.excludeNormalVersatile = action.payload.value
                        break
                    case 'ConfirmDraft':
                        state.confirmDraft = action.payload.value
                        break
                    default:
                        break
                }
            },
            prepare(name, value) {
                if (name.includes('BurnCard')) {
                    const settingID = name.substring(8)
                    return { payload: { setting: 'BurnCard', value: { id: settingID-1, value: value }}}
                }
                else if (name.includes('ExileCheckbox')) {
                    const checkboxID = name.substring(13)
                    return { payload: { setting: 'ExileCheckbox', id: checkboxID, value: value }}
                }
                else if (name.includes('ResearchCheckbox')) {
                    const checkboxID = name.substring(16)
                    return { payload: { setting: 'ResearchCheckbox', value: checkboxID }}
                }
                else if (name.includes('OtherUpgrade')) {
                    const settingID = name.substring(12)
                    return { payload: {setting: 'OtherUpgrade', value: { id: settingID, value: value }}}
                }
                            
                return { payload: {setting: name, value: value } }
            }
        },
        beginDraft(state, action) {
            state.drafting = true
        },
        endDraft(state, action) {
            state.drafting = false
            state.complete = action.payload
        },
        reset(state, action) {
            const deckSizeValue = state.selectedDeckSize ? state.selectedDeckSize : state.investigatorData.deck_requirements.size

            state.deckSize = deckSizeValue
            state.selectedDeckSize = deckSizeValue
            state.burnCards = [ '', '' ]
            state.exileSelection = {}
            state.researchSelection = {}
            state.otherUpgradeSettings = { GMM: '0' }
            state.removedCards = 0
            state.drafting = false
            state.complete = false
            state.imagesrc = null
            state.imagepos = 0
        },
        updateImageOverlay(state, action) {
            state.imagesrc = action.payload.imagesrc
            state.imagepos = action.payload.position
        }
    }
})

function changeInvestigatorList(entry) {
    return function changeInvestigatorThunk(dispatch, getState) {
        let re = /(.*)(\s\(Parallel\))/

        const match = entry.match(re)
        let name = entry
        let parallel = false

        if (match) {
            name = match[1]
            parallel = true
        }

        const cardData = getState().data.cardData
        const investigatorID = Object.keys(cardData)
        .filter(key => {
            return cardData[key].name === name && (parallel ? typeof cardData[key].alternate_of_name !== 'undefined' : true)
        })[0]

        dispatch(changeInvestigator({ data: cardData[investigatorID], parallel: parallel }))
    }
}

function changeInvestigatorDeck(data, parallel) {
    return function changeInvestigatorThunk(dispatch, getState) {
        dispatch(changeInvestigator( { data: data, parallel: parallel }))
    }
}

function calculateFilteredCount(dispatch, getState) {
    const state = getState()

    const filteredCards = FilterCards({
        cardData: state.data.cardData,
        investigatorData: state.settings.investigatorData,
        parallel: state.settings.parallel,
        secondaryClass: state.settings.secondaryClass,
        traitChoice: state.settings.traitChoice,
        filteredResearch: state.settings.filteredResearch,
        researchSelection: state.settings.researchSelection,
        excludeNormalVersatile: state.settings.excludeNormalVersatile,
        draftUseLimited: state.settings.draftUseLimited,
        mergedList: state.draft.mergedList,
        deckList: state.draft.deckList,
        draftProgress: state.draft.progress,
        draftXP: state.settings.draftXP,
        draftWeighting: state.settings.draftWeighting,
        deckSize: state.settings.deckSize,
        phase: state.draft.phase,
        collection: state.collection,
        deckModifiers: state.draft.deckModifiers,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds,
        level0Requirements: state.draft.level0Requirements
    })

    const count = filteredCount({
        filteredData: filteredCards,
        draftType: state.draft.draftType,
        collection: state.collection
    })

    // for filtered research, we need all draftable cards, level 0-5
    const allFilteredCards = FilterCards({
        cardData: state.data.cardData,
        investigatorData: state.settings.investigatorData,
        parallel: state.settings.parallel,
        secondaryClass: state.settings.secondaryClass,
        traitChoice: state.settings.traitChoice,
        filteredResearch: {},
        researchSelection: state.settings.researchSelection,
        excludeNormalVersatile: state.settings.excludeNormalVersatile,
        draftUseLimited: state.settings.draftUseLimited,
        mergedList: [],
        deckList: [],
        draftProgress: state.draft.progress,
        draftXP: state.settings.draftXP,
        draftWeighting: state.settings.draftWeighting,
        deckSize: state.settings.deckSize,
        phase: DraftPhases.AllCards,
        collection: state.collection,
        deckModifiers: state.draft.deckModifiers,
        level0Swaps: [],
        level0Adds: [],
        level0Requirements: []
    })

    const research = filterResearch({
        filteredData: allFilteredCards
    })

    dispatch(changeSetting('FilteredCount', count))
    dispatch(changeSetting('FilteredResearch', research))
}

export const { changeInvestigator, changeSetting, beginDraft, endDraft, reset, updateImageOverlay } = settingsSlice.actions
export { changeInvestigatorList, changeInvestigatorDeck, calculateFilteredCount }

export default settingsSlice.reducer