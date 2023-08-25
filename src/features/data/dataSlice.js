import { createSlice } from '@reduxjs/toolkit'

import { reset, changeSetting, changeInvestigatorList, changeInvestigatorDeck, calculateFilteredCount } from '../settings/settingsSlice'
import { setDeckList, changeDeckName, changeLevel0, updateDeckRequirements } from '../draft/draftSlice'

import DraftPhases from '../../data/DraftPhases'
import { listCardFromDBData } from '../../draft/DrawDraft'

const initialState = {
    cardData: null,
    tabooData: null,
    fetchError: false,
    deckFetchError: false,
    tabooMerged: false,
    deckLoading: false,
    deckLoaded: false
}

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        updateCardData(state, action) {
            state.cardData = action.payload
        },
        updateTabooData(state, action) {
            state.tabooData = action.payload
        },
        mergeTaboo(state, action) {
            if (state.tabooData && state.cardData) {
                state.cardData = mergeTabooData(state.cardData, state.tabooData, action.payload)
                state.tabooMerged = true
            }
        },
        changeFetchError(state, action) {
            state.fetchError = action.payload
        },
        changeDeckLoading(state, action) {
            state.deckLoading = action.payload
        },
        changeDeckFetchError(state, action) {
            state.deckFetchError = action.payload
        },
        changeDeckLoaded(state, action) {
            state.deckLoaded = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(reset, function (state, action) {
            state.deckLoading = false
            state.fetchError = false
            state.deckFetchError = false
            state.deckLoaded = false
            state.tabooMerged = false
        })
/*
        'settings/reset': (state, action) => {
            state.deckLoading = false
            state.fetchError = false
            state.deckFetchError = false
            state.deckLoaded = false
            state.tabooMerged = false
        }
*/
    }
})

export async function fetchCards(dispatch, getState) {
    fetch("https://arkhamdb.com/api/public/cards/")
    .then(res => {
        return res.json()
    })
    .then(res => {
        dispatch(updateCardData(res))
        dispatch(changeInvestigatorList( 'Agnes Baker' ))

        dispatch(calculateFilteredCount)
    })
    .catch((err) => {
        dispatch(changeFetchError(true))
    })
}

export async function fetchTaboo(dispatch, getState) {
    fetch("https://arkhamdb.com/api/public/taboos/")
    .then(res => {
        return res.json()
    })
    .then(res => {
        res = res.map(item => {
            item.cards = JSON.parse(item.cards)
            return item
        }).sort((item1, item2) => item1.id > item2.id ? 1 : -1)

        dispatch(updateTabooData(res))

        dispatch(calculateFilteredCount)
    })
    .catch((err) => {
        dispatch(changeFetchError(true))
    })
}

export async function fetchDeck(dispatch, getState) {
    const deckID = getState().settings.deckID

    fetch("https://arkhamdb.com/api/public/deck/" + deckID + '.json')
    .then(res => {
        return res.json()
    })
    .then(res => {
        const cardData = getState().data.cardData

        dispatch(changeDeckLoading(false))

        const meta = res.meta.length > 0 ? JSON.parse(res.meta) : []
        const parallel = (meta.alternate_back && meta.alternate_back !== undefined)

        const investigatorCode = parallel ? meta.alternate_back : res.investigator_code

        if (cardData) {
//            we need to set appropriate taboo...
            const investigatorID = Object.keys(cardData)
            .filter(key => {
                return cardData[key].code === investigatorCode
            })[0]

            dispatch(changeInvestigatorDeck(cardData[investigatorID], parallel))

            dispatch(calculateFilteredCount)

// meta:
//  deck_size_selected
//  faction_selected
//  alternate_front
//  alternate_back

            let deckSize = 0

            if (typeof meta.deck_size_selected !== 'undefined') {
                deckSize = meta.deck_size_selected
                dispatch(changeSetting('SelectedDeckSize', meta.deck_size_selected))
            }
            else {
                deckSize = cardData[investigatorID].deck_requirements.size
                dispatch(changeSetting('SelectedDeckSize', ''))
            }

            if (typeof meta.faction_selected !== 'undefined') {
                dispatch(changeSetting('SecondaryClass', meta.faction_selected))
            }
            else {
                const classOptions = cardData[investigatorID].deck_options.filter(item => item.name === 'Secondary Class')

                if (classOptions.length > 0) {
                    dispatch(changeSetting('SecondaryClass', classOptions[0].faction_select[0]))
                }
            }

            const tabooID = res.taboo_id === null ? 0 : res.taboo_id

            // load deckData
            var deckCardIDs = Object.keys(res.slots)
            var newDeckList = []

            // remove random basic weakness
            deckCardIDs = deckCardIDs.filter(item => {
                if (item !== '01000') return true
                return false
            })

            // this ignores story assets, as they're not in the ArkhamDB player card list
            newDeckList = deckCardIDs.map(item => {
                const cardID = cardData.findIndex(card => card.code === item)

                if (cardID >= 0) {
                    const card = cardData[cardID]

                    return listCardFromDBData(card, res.slots[item])
                }
                else return null
            })

            newDeckList = newDeckList.filter(item => item !== null)

            const adaptableCount = newDeckList.reduce((acc, a) => {
                if (a.name === 'Adaptable') return acc + (2 * a.count)
                return acc
            }, 0)

            const versatileCount = newDeckList.reduce((acc, a) => {
                if (a.name === 'Versatile') return acc + a.count
                return acc
            }, 0)

            const knowledgeCount = newDeckList.reduce((acc, a) => {
                if (a.name === 'Ancestral Knowledge') return acc + a.count
                return acc
            }, 0)

            const underworldCount = newDeckList.reduce((acc, a) => {
                if (a.name === 'Underworld Support') return acc + a.count
                return acc
            }, 0)

            const forcedCount = newDeckList.reduce((acc, a) => {
                if (a.name === 'Forced Learning') return acc + a.count
                return acc
            }, 0)

            dispatch(changeLevel0('Exile', 0, false))
            dispatch(changeLevel0('Adaptable', adaptableCount, false))
            deckSize += (versatileCount * 5) + (knowledgeCount * 5) - (underworldCount * 5) + (forcedCount * 15)

            const burnableCards = newDeckList.map( card => {
                return card.permanent || card.subtype_code || card.signature || card.exile || (card.name === 'Burn After Reading' && card.count === 1) ? null : <option value={card.name} key={card.key}>{card.name}</option>
            }).filter( item => item !== null )

            if (burnableCards.length > 0) {
                dispatch(changeSetting('BurnCard1', burnableCards[0].key))
                dispatch(changeSetting('BurnCard2', burnableCards[0].key))
            }

            dispatch(changeSetting('DeckSize', deckSize))

            dispatch(setDeckList(newDeckList))
            dispatch(changeDeckName(res.name))
            dispatch(changeDeckLoading(false))
            dispatch(changeDeckFetchError(false))
            dispatch(changeSetting('SelectedTaboo', tabooID))
            dispatch(changeDeckLoaded(true))

            updateDeckRequirements(dispatch, getState, DraftPhases.UpgradeLevel0AddPhase)
        }
    })
    .catch((err) => {
        dispatch(changeDeckLoading(false))
        dispatch(changeDeckFetchError(true))
    })
}

export function mergeTabooData(cData, tData, selectedTaboo) {
    var tabooData = selectedTaboo === 0 ? null : tData.filter(item => item.id === selectedTaboo)[0]

    var tCardData = cData.map(item => {
        delete item.tabooxp
        delete item.tabooexceptional
        delete item.taboodecklimit

        var tabooEntry = []   

        if (tabooData) {
            tabooEntry = tabooData.cards.filter(taboo => taboo.code === item.code)

            if (tabooEntry) {
                tabooEntry.forEach(taboo => {
                    if (taboo.xp !== undefined) item.tabooxp = taboo.xp
                    if (taboo.exceptional !== undefined && taboo.exceptional) {
                        item.tabooexceptional = true
                        item.taboodecklimit = 1
                    }
                    if (taboo.deck_limit !== undefined) {
                        item.taboodecklimit = taboo.deck_limit
                    }
                })
            }
        }
        
        return item
    })

    return tCardData
}

export const { updateCardData, updateTabooData, mergeTaboo, changeFetchError, changeDeckLoading, changeDeckFetchError, 
    changeDeckLoaded } = dataSlice.actions

export default dataSlice.reducer