import React, { useState, useEffect, useCallback } from 'react';

import App from './App';
import DrawCard from './components/DraftData'
import FilterCards from './components/DraftFilters'

function fetchData(updateCardData, updateFetchError) {
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

function fetchTaboo(updateTabooData, updateFetchError) {
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
    .catch(() => updateFetchError(true))
}

function mergeTabooData(cData, tData) {
    var tCardData = cData.map(item => {
        delete item.tabooxp
        delete item.tabooexceptional
        delete item.taboodecklimit

        var tabooEntry = null
        
        if (tData.length > 0) tabooEntry = tData[0].cards.filter(taboo => taboo.code === item.code)

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
        
        return item
    })

    return tCardData
}

function standardChaosDraft(props) {
    const { draftTab, draftCards, draftXP, draftCard, cardList } = props;
    let newList = []

    newList = newList.concat(cardList)

    let draftProgress = 0;

    let upgrading = (draftTab === 'Upgrade Deck')

    let draftTarget = draftCards
    if (upgrading) draftTarget = draftXP

    while (draftProgress < draftTarget) {
        // generates all cards, sets cardList state
        // need to do it each iteration for all investigators whose filter depends on the cards in the deck
        props.cardList = newList
        let filteredData = FilterCards(props)

        const card = DrawCard(filteredData)

        newList = draftCard(card, newList)

        draftProgress = 0;

        if (draftTab === 'Build Deck') {
            for (let item in newList) {
                // permanent don't count
                if (!newList[item].permanent) draftProgress += newList[item].count
            }

            // special deckbuilding requirements
//            if (investigator === 'Joe Diamond' || investigator === 'Lola Hayes') {
                props.cardList = newList
                props.draftProgress = draftProgress

                filteredData = FilterCards(props)
//            }
        }
        else {
            for (let item in newList) {
                draftProgress += newList[item].xp * newList[item].count
            }

            props.cardList = newList
            props.draftProgress = draftProgress
            props.draftXP = draftTarget - draftProgress

            filteredData = FilterCards(props)
        }
    }

    return newList
}

function simpleDraft(props) {
    const { draftCount } = props

    // generates draft cards
    const filteredData = FilterCards(props)

    let draftPool = []

    for (let i = 0; i < draftCount; i++) {
        const card = DrawCard(filteredData, draftPool)
        card.imageLoaded = false

        draftPool.push(card)
    }

    return draftPool
}

function AppContainer() {
    const [investigator, changeInvestigator] = useState("Agnes Baker")
    const [parallel, changeParallel] = useState(false)
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
    const [myriadCount, updateMyriadCount] = useState('1')

    const [collectionSets, updateCollectionSets] = useState({ 'core': 1, 'core2': 1
        ,'dwl': 1, 'tmm': 1, 'tece': 1, 'bota': 1, 'uau': 1, 'wda': 1, 'litas': 1
        ,'ptc': 1, 'eotp': 1, 'tuo': 1, 'apot': 1, 'tpm': 1, 'bsr': 1, 'dca': 1
        ,'tfa': 1, 'tof': 1, 'tbb': 1, 'hote': 1, 'tcoa': 1, 'tdoy': 1, 'sha': 1
        ,'tcu': 1, 'tsn': 1, 'wos': 1, 'fgg': 1, 'uad': 1, 'icc': 1, 'bbt': 1
        ,'tde': 1, 'sfk': 1, 'tsh': 1, 'dsm': 1, 'pnr': 1, 'wgd': 1, 'woc': 1
        ,'tic': 1, 'itd': 1, 'def': 1, 'hhg': 1, 'lif': 1, 'lod': 1, 'itm': 1
        ,'eoep': 1
        ,'rtnotz': 1, 'rtdwl': 1, 'rtptc': 1, 'rttfa': 1, 'rttcu': 1
        ,'nat': 1, 'har': 1, 'win': 1, 'jac': 1, 'ste': 1
        ,'books' : 0 })
    const [expandCollection, changeExpandCollection] = useState(false)

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

    useEffect(() => fetchData(updateCardData, updateFetchError), [])

    useEffect(() => fetchTaboo(updateTabooData, updateFetchError), [])

    const draftCard = useCallback((card, list) => {
        let cardXP = 0
    
        if (card.xp) {
            cardXP = card.xp
        }
        if (card.tabooxp !== undefined) cardXP += card.tabooxp
        if (card.exceptional || (card.tabooexceptional !== undefined && card.tabooexceptional)) cardXP *= 2

        if (card.name === 'Forced Learning') {
            const newDeckSize = typeof deckSize === 'string' ? parseInt(deckSize) : deckSize 
            changeDeckSize(newDeckSize + 15)
        }

        let addCount = 1

        // just let upgrade draft 1, they can choose however many they want
        // Things like Empower Self are problematic...
        if (draftTab === 'Build Deck') {
            if (card.myriad) addCount = parseInt(myriadCount)
            if (addCount > card.deck_limit) addCount = card.deck_limit
            if (draftProgressBuild + addCount > deckSize) addCount = deckSize - draftProgressBuild;
        }

        if (list) {
            const existingIndex = list.length > 0 ? list.findIndex(item => item.key === card.code) : -1
    
            if (existingIndex >= 0) {
                list.map(item => {
                    if (item.name === card.name) {
                        item.count = item.count + addCount
                        if (item.count > card.deck_limit) item.count = card.deck_limit
    
                        return item
                    }
    
                    return item
                })
            }
            else {
                list.push({ name: card.name, subtitle: card.subtitle, key: card.code, type_code: card.type_code, slot: card.slot, faction_code: card.faction_code, faction2_code: card.faction2_code, traits: card.traits, xp: cardXP, permanent: card.permanent, count: addCount, duplicateKey: card.duplicate_of_code })
            }
        }
        else {
            list = [{ name: card.name, subtitle: card.subtitle, key: card.code, type_code: card.type_code, slot: card.slot, faction_code: card.faction_code, faction2_code: card.faction2_code, traits: card.traits, xp: cardXP, permanent: card.permanent, count: addCount, duplicateKey: card.duplicate_of_code }]
        }
    
        return list
    }, [myriadCount, draftProgressBuild, deckSize, draftTab])

    useEffect(() => {
        if (building && !complete) {
            const draftProgress = (draftTab === 'Build Deck') ? draftProgressBuild : draftProgressUpgrade
            let draftTarget = 0

            if (draftTab === 'Build Deck') {
                if (draftType === 'phaseDraft') {
                    if (phase >= 3) draftTarget = deckSize
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
            
            if (draftProgress >= deckSize) {
                changeComplete(true)
                return  //??
            }

            if (newPhase) {
                if (draftType === 'chaos') {
                    // first (and only, unless Forced Learning etc) time through
                    const list = standardChaosDraft({
                        draftTab: draftTab,
                        investigator: investigator,
                        parallel: parallel,
                        secondaryClass: secondaryClass,
                        deckSize: deckSize,
                        draftCards: draftTarget - draftProgress,
                        draftProgress: draftProgress,
                        draftXP: draftTarget,
                        upgrade: (draftTab === 'Upgrade'),
                        cardList: cardList,
                        collectionSets: collectionSets,
                        cardData: cardData,
                        draftCard: draftCard
                    })

                    updateCardList(list)
//                    changeNewPhase(false)
//                    if (draftTarget >= deckSize) changeComplete(true)
                }
                else if (draftProgress < draftTarget) {
                    if (draftCount[phase-1] === '1') {
                        const list = standardChaosDraft({
                            draftTab: draftTab,
                            investigator: investigator,
                            parallel: parallel,
                            secondaryClass: secondaryClass,
                            deckSize: deckSize,
                            draftCards: draftTarget - draftProgress,
                            draftProgress: draftProgress,
                            draftXP: draftTarget,
                            upgrade: (draftTab === 'Upgrade'),
                            cardList: cardList,
                            cardData: cardData,
                            collectionSets: collectionSets,
                            draftCard: draftCard
                        })    
     
                        updateCardList(list)
                        changePhase(phase + 1)
                    }
                    else {
                        const pool = simpleDraft({
                            investigator: investigator,
                            parallel: parallel,
                            secondaryClass: secondaryClass,
                            deckSize: deckSize,
                            draftCount: draftCount[phase-1],
                            draftProgress: draftProgress,
                            draftUseLimited: draftUseLimited[phase-1],
                            draftXP: draftXP - draftProgress,
                            upgrade: (draftTab === 'Upgrade'),
                            cardList: cardList,
                            cardData: cardData,
                            collectionSets: collectionSets
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
                            const pool = simpleDraft({
                                investigator: investigator,
                                parallel: parallel,
                                secondaryClass: secondaryClass,
                                deckSize: deckSize,
                                draftCount: draftCount[phase-1],
                                draftProgress: draftProgress,
                                draftUseLimited: draftUseLimited[phase-1],
                                draftXP: draftXP - draftProgress,
                                upgrade: (draftTab === 'Upgrade'),
                                cardList: cardList,
                                cardData: cardData,
                                collectionSets: collectionSets
                            })

                            updateDraftPool(pool)
                        }
                        else {
                            changeComplete(true)
                        }
                    }
                    else {
                        if (draftProgress < draftTarget) {
                            const pool = simpleDraft({
                                investigator: investigator,
                                parallel: parallel,
                                secondaryClass: secondaryClass,
                                deckSize: deckSize,
                                draftCount: draftCount[phase-1],
                                draftProgress: draftProgress,
                                draftUseLimited: draftUseLimited[phase-1],
                                draftXP: draftXP - draftProgress,
                                upgrade: (draftTab === 'Upgrade'),
                                cardList: cardList,
                                cardData: cardData,
                                collectionSets: collectionSets
                            })
   
                            updateDraftPool(pool)
                        }
                        else {
                            if (phase >= 3) {
                                if (draftProgress < deckSize) {
                                    const list = standardChaosDraft({
                                        draftTab: draftTab,
                                        investigator: investigator,
                                        parallel: parallel,
                                        secondaryClass: secondaryClass,
                                        deckSize: deckSize,
                                        draftCards: draftTarget - draftProgress,
                                        draftProgress: draftProgress,
                                        draftXP: draftXP - draftProgress,
                                        upgrade: (draftTab === 'Upgrade'),
                                        cardList: cardList,
                                        cardData: cardData,
                                        collectionSets: collectionSets,
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
    }, [building, complete, newPhase, draftType, draftProgressBuild, draftProgressUpgrade, deckSize, investigator, parallel, cardList, cardData, tabooData, collectionSets, draftCount, draftUseLimited, phase, draftCards, draftPool, draftTab, draftXP, secondaryClass, draftCard])
    
    function handleInvestigatorChange(value, parallel) {
        changeParallel(parallel)
        changeInvestigator(value)

        if (cardData) {
            const investigatorID = Object.keys(cardData)
            .filter(key => {
//                    return  cardData[key].name === value
                return cardData[key].name === value && (parallel ? typeof cardData[key].alternate_of_name !== 'undefined' : true)
            })[0]

            changeDeckSize(cardData[investigatorID].deck_requirements.size)

            const classOptions = cardData[investigatorID].deck_options.filter(item => item.name === 'Secondary Class')

            if (classOptions.length > 0) {
                changeSecondaryClass(classOptions[0].faction_select[0])
            }

            const decksizeOptions = cardData[investigatorID].deck_options.filter(item => item.name === 'Deck Size')
            const deckSize = cardData[investigatorID].deck_requirements.size
        
            changeDeckSize(deckSize)

            if (decksizeOptions.length > 0) {
                const deckSize = decksizeOptions[0].deck_size_select[0]

                changeSelectedDeckSize(deckSize)
            }
            else {
                changeSelectedDeckSize(null)
            }
        }
    }

    function handleChange(name, value) {
        if (name === 'secondaryClass') changeSecondaryClass(value)
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
        else if (name === 'myriadCount') updateMyriadCount(value)
        else if (name === 'expandCollection') changeExpandCollection(value)
        else if (name === 'collectionSetOn') {
            var addCollectionSets = { ...collectionSets }
            
            value.forEach( set => {
                addCollectionSets[set] = 1
            })

            updateCollectionSets(addCollectionSets)
        }
        else if (name === 'collectionSetOff') {
            var removeCollectionSets = { ...collectionSets }

            value.forEach( set => {
                removeCollectionSets[set] = 0
            })

            updateCollectionSets(removeCollectionSets)
        }
        else if (name === 'building') {
            if (value === true && cardData && tabooData) {
                const investigatorID = Object.keys(cardData)
                .filter(key => {
//                    return cardData[key].name === investigator
                    return cardData[key].name === investigator && (parallel ? typeof cardData[key].alternate_of_name !== 'undefined' : true)
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
    
    function resetApp() {
        changeBuilding(false)
//        changeInitialized(false)
        changeNewPhase(true)
        updateCardList([])
        updateDraftPool([])
        changePhase(1)
        changeComplete(false)

        if (selectedDeckSize) changeDeckSize(selectedDeckSize)
        else {
            const investigatorID = Object.keys(cardData)
            .filter(key => {
                return cardData[key].name === investigator && (parallel ? typeof cardData[key].alternate_of_name !== 'undefined' : true)
            })[0]

            changeDeckSize(cardData[investigatorID].deck_requirements.size)
        }
}

    const ready = cardData && tabooData && !fetchError

    return (
        <App
        investigator={investigator}
        parallel={parallel}
        secondaryClass={secondaryClass}
        selectedDeckSize={selectedDeckSize}
        selectedTaboo={selectedTaboo}
        deckSize={deckSize}
        myriadCount={myriadCount}
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
        collectionSets={collectionSets}
        draftPool={draftPool}
        cardData={cardData}
        tabooData={tabooData}
        handleChange={handleChange}
        handleChangeInvestigator={handleInvestigatorChange}
        draftCard={draftCard}
        updateCardList={updateCardList}
        updateDraftPool={updateDraftPool}
        resetApp={resetApp}
        expandCollection={expandCollection}
        />
    )
}

export default AppContainer;
