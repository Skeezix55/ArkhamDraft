import React, { useState, useEffect } from 'react';

import App from './App';
import StandardChaos from './components/StandardChaos'
import SimpleDraft from './components/SimpleDraft'

function AppContainer() {
    const [investigator, changeInvestigator] = useState("Roland Banks")
    const [secondaryClass, changeSecondaryClass] = useState("guardian")
    const [selectedDeckSize, changeSelectedDeckSize] = useState("30")
    const [deckSize, changeDeckSize] = useState("30")
    const [draftTab, changeDraftTab] = useState("Build Deck")
    const [draftType, changeDraftType] = useState("chaos")
    const [draftCount, changeDraftCount] = useState([3, 3, 3])
    const [draftCards, changeDraftCards] = useState([10, 10, 10])
    const [building, changeBuilding] = useState(false)
    const [initialized, changeInitialized] = useState(false)

    const [fetching, changeFetching] = useState(false)
    const [cardData, updateCardData] = useState(null)
    const [fetchError, updateFetchError] = useState(false)
    const [cardList, updateCardList] = useState([])
    const [draftPool, updateDraftPool] = useState([])
    const [phase, changePhase] = useState(1)

    let cardCount = 0

    if (cardList) {
        for (let item in cardList) {
            // permanent don't count
            if (!cardList[item].permanent) cardCount += cardList[item].count
        }
    }

    useEffect(() => fetchData(), [])

    function fetchData() {
        changeFetching(true)

        fetch("https://www.arkhamdb.com/api/public/cards")
        .then(res => {
            return res.json()
        })
        .then(res => {
            updateCardData(res)
            changeFetching(false)
        })
        .catch(() => updateFetchError(true))
    }

    useEffect(() => {
        if (building && !initialized) {
            changeInitialized(true)
            if (draftType === 'chaos') {
                const list = StandardChaos({
                    investigator: investigator,
                    draftCards: deckSize,
                    upgrade: false,
                    cardList: cardList,
                    cardData: cardData,
                    draftCard: draftCard
                })
    
                updateCardList(list)
            }
            else {
                if (draftCount === 1) {
                    const list = StandardChaos({
                        investigator: investigator,
                        draftCards: draftCards[phase-1],
                        upgrade: false,
                        cardList: cardList,
                        cardData: cardData,
                        draftCard: draftCard
                    })    
    
                    updateCardList(list)
                }
                else {
                    const pool = SimpleDraft({
                        investigator: investigator,
                        upgrade: false,
                        draftCount: draftCount[phase-1],
                        cardList: cardList,
                        cardData: cardData,
                        draftCard: draftCard
                        })

                    updateDraftPool(pool)
                }
            }
        }
    }, [building, investigator, draftCards, cardList, cardData, selectedDeckSize, deckSize, draftCount, draftType, phase, initialized])

    useEffect(() => {
        if (building && draftPool.length < 1) {
            if (draftType === 'draft') {
                if (cardCount < deckSize) {
                    const pool = SimpleDraft({
                        investigator: investigator,
                        upgrade: false,
                        draftCount: draftCount[phase-1],
                        cardList: cardList,
                        cardData: cardData,
                        draftCard: draftCard
                    })

                    updateDraftPool(pool)
                }
            }
            else if (draftType === 'phaseDraft') {
                let targetCards = 0

                for (let i = 0; i < phase; i++) targetCards += parseInt(draftCards[i], 10)

                if (cardCount < targetCards) {
                    const pool = SimpleDraft({
                        investigator: investigator,
                        upgrade: false,
                        draftCount: draftCount[phase-1],
                        cardList: cardList,
                        cardData: cardData,
                        draftCard: draftCard
                    })

                    updateDraftPool(pool)
                }
                else {
                    if (phase < 3) {
                        changePhase(phase + 1)

                        const pool = SimpleDraft({
                            investigator: investigator,
                            upgrade: false,
                            draftCount: draftCount[phase],
                            cardList: cardList,
                            cardData: cardData,
                            draftCard: draftCard
                        })

                        updateDraftPool(pool)
                    }
                    else {
                        if (cardCount < deckSize) {
                            const list = StandardChaos({
                                investigator: investigator,
                                draftCards: deckSize - cardCount,
                                upgrade: false,
                                cardList: cardList,
                                cardData: cardData,
                                draftCard: draftCard
                            })    
        
                            updateCardList(list)        
                        }
                    }
                }   
            }
        }
    }, [building, draftPool, cardCount, cardData, cardList, selectedDeckSize, deckSize, draftCards, draftCount, draftType, investigator, phase])

    function handleChange(name, value) {
        if (name === 'investigator') {
            changeInvestigator(value)

            const investigatorID = Object.keys(cardData)
            .filter(key => {
                return  cardData[key].name === value
            })[0]

            changeDeckSize(cardData[investigatorID].deck_requirements.size)
        }
        else if (name === 'secondaryClass') changeSecondaryClass(value)
        else if (name === 'deckSize') {
            changeSelectedDeckSize(value)
            changeDeckSize(value)
        }
        else if (name === 'draftTab') changeDraftTab(value)
        else if (name === 'draftType') changeDraftType(value)
        else if (name === 'draftCount1') doChangeDraftCount(1, value)
        else if (name === 'draftCount2') doChangeDraftCount(2, value)
        else if (name === 'draftCount3') doChangeDraftCount(3, value)
        else if (name === 'draftCards1') doChangeDraftCards(1, value)
        else if (name === 'draftCards2') doChangeDraftCards(2, value)
        else if (name === 'draftCards3') doChangeDraftCards(3, value)
        else if (name === 'building') changeBuilding(value)
    }

    function doChangeDraftCount(index, value) {
        let newCount = []
        newCount = newCount.concat(draftCount)
        newCount[index-1] = value
        changeDraftCount(newCount)
    }

    function doChangeDraftCards(index, value) {
        let newCards = []
        newCards = newCards.concat(draftCards)
        newCards[index-1] = value
        changeDraftCards(newCards)
    }

    function draftCard(card, list) {
        if (list) {
            const existingIndex = list.length > 0 ? list.findIndex(item => item.key === card.code) : -1

            if (existingIndex >= 0) {
                list.map(item => {
                    if (item.name === card.name) {
                        item.count = item.count + 1
                        return item
                    }

                    return item
                })
            }
            else {
                list.push({ name: card.name, key: card.code, type: card.type_code, slot: card.slot, faction_code: card.faction_code, faction2_code: card.faction2_code, xp: card.xp, permanent: card.permanent, count: 1 })
            }
        }
        else {
            list = [{ name: card.name, key: card.code, type: card.type_code, slot: card.slot, faction_code: card.faction_code, faction2_code: card.faction2_code, xp: card.xp, permanent: card.permanent, count: 1 }]
        }

        return list
    }

    const ready = cardData && !fetching && !fetchError

    return (
        <App
        investigator={investigator}
        secondaryClass={secondaryClass}
        deckSize={deckSize}
        draftTab={draftTab}
        draftType={draftType}
        draftCount={draftCount}
        draftCards={draftCards}
        cardCount={cardCount}
        ready={ready}
        building={building}
        fetchError={fetchError}
        phase={phase}
        cardList={cardList}
        draftPool={draftPool}
        cardData={cardData}
        handleChange={handleChange}
        draftCard={draftCard}
        updateCardList={updateCardList}
        updateDraftPool={updateDraftPool}
        />
    )
}

export default AppContainer;
