import React, { useState, useEffect } from 'react';

import App from './App';
import StandardChaos from './components/StandardChaos'
import SimpleDraft from './components/SimpleDraft'

function AppContainer() {
    const [investigator, changeInvestigator] = useState("Roland Banks")
    const [secondaryClass, changeSecondaryClass] = useState(null)
    const [selectedDeckSize, changeSelectedDeckSize] = useState(null)
    const [selectedTaboo, changeSelectedTaboo] = useState('None')
    const [deckSize, changeDeckSize] = useState("30")
    const [draftTab, changeDraftTab] = useState("Build Deck")
    const [draftType, changeDraftType] = useState("draft")
    const [draftWeighting, changeDraftWeighting] = useState('medium')
    const [draftXP, changeDraftXP] = useState(1)
    const [draftCount, changeDraftCount] = useState([3, 3, 3])
    const [draftCards, changeDraftCards] = useState([10, 10, 10])
    const [draftUseLimited, changeDraftUseLimited] = useState([true, true, true])
    const [building, changeBuilding] = useState(false)
    const [newPhase, changeNewPhase] = useState(true)
//    const [fetching, changeFetching] = useState(false)
    const [cardData, updateCardData] = useState(null)
    const [tabooData, updateTabooData] = useState(null)
//    const [tabooCardData, updateTabooCardData] = useState(null)
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

    useEffect(() => fetchTaboo(), [])

    function fetchData() {
//        fetch("https://cors-anywhere.herokuapp.com/https://arkhamdb.com/api/public/cards/")
        fetch("https://arkhamdb.com/api/public/cards/")
        .then(res => {
            return res.json()
        })
        .then(res => {
            updateCardData(res)
        })
        .catch(() => updateFetchError(true))
    }

    function fetchTaboo() {
//        fetch("https://cors-anywhere.herokuapp.com/https://arkhamdb.com/api/public/cards/")
        fetch("https://arkhamdb.com/api/public/taboos/")
        .then(res => {
            return res.json()
        })
        .then(res => {
            res = res.map(item => {
                item.cards = JSON.parse(item.cards)
                return item
            }).sort((item1, item2) => item1.id > item2.id ? 1 : -1)

            updateTabooData(res)
        })
        .catch(() => {})
    }

    function mergeTabooData(cData, tData) {
        var tCardData = cData.map(item => {
            delete item.tabooxp
            delete item.tabooexceptional

            var tabooEntry = null
            
            if (tData.length > 0) tabooEntry = tData[0].cards.filter(taboo => taboo.code === item.code)

            if (tabooEntry) {
                tabooEntry.forEach(taboo => {
                    if (taboo.xp) item.tabooxp = taboo.xp
                    if (taboo.exceptional) item.tabooexceptional = true
                })
            }
            
            return item
        })

        return tCardData
    }

    useEffect(() => {
        if (building && !complete) {
            const draftProgress = (draftTab === 'Build Deck') ? draftProgressBuild : draftProgressUpgrade
            let draftTarget = 0

            if (draftTab === 'Build Deck') {
                if (draftType === 'phaseDraft') {
                    if (phase > 3) draftTarget = deckSize
                    else for (let i = 0; i < phase; i++) draftTarget += parseInt(draftCards[i], 10)
                    
                    if (draftTarget > deckSize) draftTarget = deckSize
                }
                else {
                    draftTarget = deckSize
                }
            }
            else
            {
                draftTarget = draftXP
            }

            if (newPhase) {
                if (draftType === 'chaos') {
                    // first (and only) time through
                    const list = StandardChaos({
                        investigator: investigator,
                        secondaryClass: secondaryClass,
//                        selectedTaboo: tabooData.filter(item => item.code === selectedTaboo ? true : false),
                        deckSize: deckSize,
                        draftCards: deckSize,
                        draftXP: draftXP - draftProgress,
                        upgrade: (draftTab === 'Upgrade'),
                        cardList: cardList,
//                        tabooData: tabooData,
                        cardData: cardData,
                        draftCard: draftCard
                    })
        
                    updateCardList(list)
                    changeNewPhase(false)
                    changeComplete(true)
                }
                else if (draftProgress < draftTarget) {
                    if (draftCount[phase-1] === 1) {
                        const list = StandardChaos({
                            investigator: investigator,
                            secondaryClass: secondaryClass,
                            deckSize: deckSize,
                            draftCards: draftTarget - draftProgress,
                            draftXP: draftXP - draftProgress,
                            upgrade: (draftTab === 'Upgrade'),
                            cardList: cardList,
                            cardData: cardData,
//                            tabooData: tabooData.filter(item => item.code === selectedTaboo ? true : false),
                            draftCard: draftCard
                        })    
        
                        updateCardList(list)
                        changePhase(phase + 1)
                    }
                    else {
                        const pool = SimpleDraft({
                            investigator: investigator,
                            secondaryClass: secondaryClass,
                            deckSize: deckSize,
                            draftCount: draftCount[phase-1],
                            draftUseLimited: draftUseLimited[phase-1],
                            draftXP: draftXP - draftProgress,
                            upgrade: (draftTab === 'Upgrade'),
                            cardList: cardList,
                            cardData: cardData,
//                            tabooData: tabooData.filter(item => item.code === selectedTaboo ? true : false),
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
                        if (draftProgress < draftTarget) {
                            const pool = SimpleDraft({
                                investigator: investigator,
                                secondaryClass: secondaryClass,
                                deckSize: deckSize,
                                draftCount: draftCount[phase-1],
                                draftUseLimited: draftUseLimited[phase-1],
                                draftXP: draftXP - draftProgress,
                                upgrade: (draftTab === 'Upgrade'),
                                cardList: cardList,
                                cardData: cardData,
//                                tabooData: tabooData.filter(item => item.code === selectedTaboo ? true : false),
                                draftCard: draftCard
                            })
        
                            updateDraftPool(pool)
                        }
                        else {
                            changeComplete(true)
                        }
                    }
                    else {
                        if (draftProgress < draftTarget) {
                            const pool = SimpleDraft({
                                investigator: investigator,
                                secondaryClass: secondaryClass,
                                deckSize: deckSize,
                                draftCount: draftCount[phase-1],
                                draftUseLimited: draftUseLimited[phase-1],
                                draftXP: draftXP - draftProgress,
                                upgrade: (draftTab === 'Upgrade'),
                                cardList: cardList,
                                cardData: cardData,
//                                tabooData: tabooData.filter(item => item.code === selectedTaboo ? true : false),
                                draftCard: draftCard
                            })
    
                            updateDraftPool(pool)
                        }
                        else {
                            if (phase >= 3) {
                                if (draftProgress < deckSize) {
                                    const list = StandardChaos({
                                        investigator: investigator,
                                        secondaryClass: secondaryClass,
                                        deckSize: deckSize,
                                        draftCards: deckSize - draftProgress,
                                        draftXP: draftXP - draftProgress,
                                        upgrade: (draftTab === 'Upgrade'),
                                        cardList: cardList,
                                        cardData: cardData,
//                                        tabooData: tabooData.filter(item => item.code === selectedTaboo ? true : false),
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
    }, [building, complete, newPhase, draftType, draftProgressBuild, draftProgressUpgrade, deckSize, investigator, cardList, cardData, tabooData, draftCount, draftUseLimited, phase, draftCards, draftPool, draftTab, draftXP, secondaryClass])

    function handleChange(name, value) {
        if (name === 'investigator') {
            changeInvestigator(value)

            if (cardData && !selectedDeckSize) {
                const investigatorID = Object.keys(cardData)
                .filter(key => {
                    return  cardData[key].name === value
                })[0]

                changeDeckSize(cardData[investigatorID].deck_requirements.size)

                const classOptions = cardData[investigatorID].deck_options.filter(item => item.name === 'Secondary Class')

                if (classOptions.length > 0) {
                    changeSecondaryClass(classOptions[0].faction_select[0])
                }
            }
        }
        else if (name === 'secondaryClass') changeSecondaryClass(value)
        else if (name === 'selectedDeckSize') {
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
        else if (name === 'draftUseLimited1') doChangeDraftUseLimited(1, value)
        else if (name === 'draftUseLimited2') doChangeDraftUseLimited(2, value)
        else if (name === 'draftUseLimited3') doChangeDraftUseLimited(3, value)
        else if (name === 'taboo') changeSelectedTaboo(value)
        else if (name === 'building') {
            if (value === true && cardData && tabooData) {
//            if (value == true && cardData) {
                const investigatorID = Object.keys(cardData)
                .filter(key => {
                    return  cardData[key].name === investigator
                })[0]

                if (!selectedDeckSize) {
                    changeDeckSize(cardData[investigatorID].deck_requirements.size)    
                }

                if (!secondaryClass) {
                    const classOptions = cardData[investigatorID].deck_options.filter(item => item.name === 'Secondary Class')

                    if (classOptions.length > 0) {
                        changeSecondaryClass(classOptions[0].faction_select[0])
                    }
                }

                let tData = tabooData.filter(item => item.code === selectedTaboo ? true : false)

                updateCardData(mergeTabooData(cardData, tData))
            }
            changeBuilding(value)
        }
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

    function doChangeDraftUseLimited(index, value) {
        let newUseLimited = []
        newUseLimited = newUseLimited.concat(draftUseLimited)
        newUseLimited[index-1] = !draftUseLimited[index-1]
        changeDraftUseLimited(newUseLimited)
    }

    function draftCard(card, list) {
        let cardXP = 0

        if (card.xp) {
            cardXP = card.xp
            if (card.exceptional) cardXP *= 2
        }

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
                list.push({ name: card.name, key: card.code, type_code: card.type_code, slot: card.slot, faction_code: card.faction_code, faction2_code: card.faction2_code, traits: card.traits, xp: cardXP, permanent: card.permanent, count: 1 })
            }
        }
        else {
            list = [{ name: card.name, key: card.code, type_code: card.type_code, slot: card.slot, faction_code: card.faction_code, faction2_code: card.faction2_code, traits: card.traits, xp: cardXP, permanent: card.permanent, count: 1 }]
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

    const ready = cardData && tabooData && !fetchError

    return (
        <App
        investigator={investigator}
        secondaryClass={secondaryClass}
        selectedDeckSize={selectedDeckSize}
        selectedTaboo={selectedTaboo}
        deckSize={deckSize}
        draftTab={draftTab}
        draftType={draftType}
        draftWeighting={draftWeighting}
        draftXP={draftXP}
        draftCount={draftCount}
        draftCards={draftCards}
        draftUseLimited={draftUseLimited}
        draftProgress={draftTab === 'Build Deck' ? draftProgressBuild : draftProgressUpgrade}
        ready={ready}
        building={building}
        fetchError={fetchError}
        phase={phase}
        cardList={cardList}
        draftPool={draftPool}
        cardData={cardData}
        tabooData={tabooData}
        handleChange={handleChange}
        draftCard={draftCard}
        updateCardList={updateCardList}
        updateDraftPool={updateDraftPool}
        resetApp={resetApp}
        />
    )
}

export default AppContainer;
