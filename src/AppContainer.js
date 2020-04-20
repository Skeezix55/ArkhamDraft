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
    const [draftType, changeDraftType] = useState("draft")
    const [draftWeighting, changeDraftWeighting] = useState('medium')
    const [draftXP, changeDraftXP] = useState(1)
    const [draftCount, changeDraftCount] = useState([3, 3, 3])
    const [draftCards, changeDraftCards] = useState([10, 10, 10])
    const [building, changeBuilding] = useState(false)
//    const [initialized, changeInitialized] = useState(false)
    const [newPhase, changeNewPhase] = useState(true)
    const [fetching, changeFetching] = useState(false)
    const [cardData, updateCardData] = useState(null)
    const [fetchError, updateFetchError] = useState(false)
    const [cardList, updateCardList] = useState([])
    const [draftPool, updateDraftPool] = useState([])
    const [phase, changePhase] = useState(1)
    const [complete, changeComplete] = useState(false)

    // card count for Build, xp for Upgrade
    let draftProgressBuild = 0
    let draftProgressUpgrade = 0

    if (cardList) {
        for (let item in cardList) {
            // permanent don't count
            if (!cardList[item].permanent) draftProgressBuild += cardList[item].count
            draftProgressUpgrade += cardList[item].xp * cardList[item].count;
        }
    }

    useEffect(() => fetchData(), [])

    function fetchData() {
        changeFetching(true)

        fetch("https://cors-anywhere.herokuapp.com/https://arkhamdb.com/api/public/cards/")
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
        if (building && !complete) {
            const draftProgress = (draftTab === 'Build Deck') ? draftProgressBuild : draftProgressUpgrade

            if (newPhase) {
                if (draftType === 'chaos') {
                    // first (and only) time through
                    const list = StandardChaos({
                        investigator: investigator,
                        draftCards: deckSize,
                        draftXP: draftXP,
                        upgrade: (draftTab === 'Upgrade'),
                        cardList: cardList,
                        cardData: cardData,
                        draftCard: draftCard
                    })
        
                    updateCardList(list)
                    changeNewPhase(false)
                    changeComplete(true)
                }
                else if (draftProgress < deckSize) {
                    if (draftCount[phase-1] == 1) {
                        const list = StandardChaos({
                            investigator: investigator,
                            draftCards: draftCards[phase-1],
                            draftXP: draftXP,
                            upgrade: (draftTab === 'Upgrade'),
                            cardList: cardList,
                            cardData: cardData,
                            draftCard: draftCard
                        })    
        
                        updateCardList(list)
                        changePhase(phase + 1)
                    }
                    else {
                        const pool = SimpleDraft({
                            investigator: investigator,
                            draftCount: draftCount[phase-1],
                            draftXP: draftXP,
                            upgrade: (draftTab === 'Upgrade'),
                            cardList: cardList,
                            cardData: cardData,
                            draftCard: draftCard
                            })
    
                        updateDraftPool(pool)    
                        changeNewPhase(false)
                    }
                }
            }
            else {
                if (draftPool.length < 1) {
                    if (draftType === 'draft') {
                        if (draftProgress < deckSize) {
                            const pool = SimpleDraft({
                                investigator: investigator,
                                draftCount: draftCount[phase-1],
                                draftXP: draftXP,
                                upgrade: (draftTab === 'Upgrade'),
                                cardList: cardList,
                                cardData: cardData,
                                draftCard: draftCard
                            })
        
                            updateDraftPool(pool)
                        }
                        else {
                            changeComplete(true)
                        }
                    }
                    else {
                        let targetCards = 0
                        for (let i = 0; i < phase; i++) targetCards += parseInt(draftCards[i], 10)
                        if (targetCards > deckSize) targetCards = deckSize

                        if (draftProgress < targetCards) {
                            const pool = SimpleDraft({
                                investigator: investigator,
                                draftCount: draftCount[phase-1],
                                draftXP: draftXP,
                                upgrade: (draftTab === 'Upgrade'),
                                cardList: cardList,
                                cardData: cardData,
                                draftCard: draftCard
                            })
    
                            updateDraftPool(pool)
                        }
                        else {
                            if (phase >= 3) {
                                if (draftProgress < deckSize) {
                                    const list = StandardChaos({
                                        investigator: investigator,
                                        draftCards: deckSize - draftProgress,
                                        draftXP: draftXP,
                                        upgrade: (draftTab === 'Upgrade'),
                                        cardList: cardList,
                                        cardData: cardData,
                                        draftCard: draftCard
                                    })    
                
                                    updateCardList(list)
                                }
                                
                                changeComplete(true)
                            }
                            else {
                                changePhase(phase + 1)
                                changeNewPhase(true)
                            }
                        }
                    }
                }
            }
        }
    }, [building, complete, newPhase, draftType, draftProgressBuild, draftProgressUpgrade, deckSize, investigator, cardList, cardData, draftCount, phase, draftCards, draftPool, draftTab])

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
        else if (name === 'draftWeighting') changeDraftWeighting(value)
        else if (name === 'draftXP') changeDraftXP(value)
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

    function resetApp() {
        changeBuilding(false)
//        changeInitialized(false)
        changeNewPhase(true)
        updateCardList([])
        updateDraftPool([])
        changePhase(1)
        changeComplete(false)
    }

    const ready = cardData && !fetching && !fetchError

    return (
        <App
        investigator={investigator}
        secondaryClass={secondaryClass}
        deckSize={deckSize}
        draftTab={draftTab}
        draftType={draftType}
        draftWeighting={draftWeighting}
        draftXP={draftXP}
        draftCount={draftCount}
        draftCards={draftCards}
        draftProgress={draftTab === 'Build Deck' ? draftProgressBuild : draftProgressUpgrade}
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
        resetApp={resetApp}
        />
    )
}

export default AppContainer;
