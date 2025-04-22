import { changeSetting } from '../features/settings/settingsSlice'
import { addToBuildXPList, changePhase, addLevel0, draftVersatile, draftLevel0, advanceDraft, addDeckModifier,
    addToCardList, changeProgress, addToDraftPool, clearDraftPool, setInsufficientOptions, addToRemovedList, 
    calculateNeededExileCheckboxes, updateDeckRequirements } from '../features/draft/draftSlice'

import FilterCards from '../data/CardFilter'
import { addModifiers, updateDraftModifiers, availableUpgrades, fillCardModifiers } from './Modifiers'
import DraftPhases, { isUpgrade, isLevel0Build, isLevel0Upgrade } from '../data/DraftPhases'
import ResearchLogs from '../data/ResearchLogs'

export function fillDraft() {
    return function fillDraftThunk(dispatch, getState) {
        dispatch(clearDraftPool())

        let state = getState()
        const draftType = state.settings.draftType

        let draftTarget = calculateDraftTarget({
            draftType: state.settings.draftType,
            draftXP: state.settings.draftXP,
            phase: state.draft.phase,
            draftCards: state.settings.draftCards,
            deckSize: state.settings.deckSize,
            level0Swaps: state.draft.level0Swaps,
            level0Adds: state.draft.level0Adds
        })

        if (draftType === 'chaos') {
            let draftProgress = state.draft.progress

            while (draftProgress < draftTarget) {
                StandardChaosDraft(dispatch, getState)

                state = getState()

                draftProgress = state.draft.progress

                draftTarget = calculateDraftTarget({
                    draftType: state.settings.draftType,
                    draftXP: state.settings.draftXP,
                    phase: state.draft.phase,
                    draftCards: state.settings.draftCards,
                    deckSize: state.settings.deckSize,
                    level0Swaps: state.draft.level0Swaps,
                    level0Adds: state.draft.level0Adds
                })
            }

            testForAdvance(dispatch, getState)
        }
        else {
            if (state.settings.draftCount[state.draft.phase-1] === 1) {
                StandardChaosDraft(dispatch, getState)

                testForAdvance(dispatch, getState)
            }
            else {
                SimpleDraft(dispatch, getState)
            }
        }    
    }
}

export function draftCard() {
    return function draftCardThunk(dispatch, getState) {
        let state = getState()

        const draftPool = state.draft.draftPool
        const draftIndex = state.draft.draftIndex

        let filteredData = FilterCards({
            cardData: state.data.cardData,
            investigatorData: state.settings.investigatorData,
            parallel: state.settings.parallel,
            secondaryClass: state.settings.secondaryClass,
            classChoices: state.settings.classChoices,
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
//console.log('Filtered count: ' + filteredData.length)
        if (draftIndex >= 0) {
            const draftTarget = calculateDraftTarget({
                draftType: state.settings.draftType,
                draftXP: state.settings.draftXP,
                phase: state.draft.phase,
                draftCards: state.settings.draftCards,
                deckSize: state.settings.deckSize,
                level0Swaps: state.draft.level0Swaps,
                level0Adds: state.draft.level0Adds
            })

            DraftCard(dispatch, getState, draftPool[draftIndex], filteredData, draftTarget)

            state = getState()

            const draftProgress = calculateDraftProgress({
                cardList: state.draft.cardList,
                removedList: state.draft.removedList,
                phase: state.draft.phase,
                level0Swaps: state.draft.level0Swaps,
                level0Adds: state.draft.level0Adds
            })

            dispatch(changeProgress(draftProgress))

            testForAdvance(dispatch, getState)
        }
    }
}

function StandardChaosDraft(dispatch, getState) {
    // generates all cards, sets cardList state
    // need to do it each iteration for all investigators whose filter depends on the cards in the deck
    
    let state = getState()

    let filteredData = FilterCards({
        cardData: state.data.cardData,
        investigatorData: state.settings.investigatorData,
        parallel: state.settings.parallel,
        secondaryClass: state.settings.secondaryClass,
        classChoices: state.settings.classChoices,
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

    const draftTarget = calculateDraftTarget({
        draftType: state.settings.draftType,
        draftXP: state.settings.draftXP,
        phase: state.draft.phase,
        draftCards: state.settings.draftCards,
        deckSize: state.settings.deckSize,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    let draftProgress = calculateDraftProgress({
        cardList: state.draft.cardList,
        removedList: state.draft.removedList,
        phase: state.draft.phase,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    
    const card = DrawCard(filteredData, state.draft.phase, state.draft.mergedList, state.draft.deckModifiers, [], draftProgress, draftTarget, state.settings.investigator, state.settings.parallel)
    DraftCard(dispatch, getState, card, filteredData, draftTarget)
    
    state = getState()

    draftProgress = calculateDraftProgress({
        removedList: state.draft.removedList,
        cardList: state.draft.cardList,
        phase: state.draft.phase,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    dispatch(changeProgress(draftProgress))
}

function SimpleDraft(dispatch, getState) {
    let state = getState()

// generates draft cards
    const filteredData = FilterCards({ 
        cardData: state.data.cardData,
        investigatorData: state.settings.investigatorData,
        parallel: state.settings.parallel,
        secondaryClass: state.settings.secondaryClass,
        classChoices: state.settings.classChoices,
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

    const draftTarget = calculateDraftTarget({
        draftType: state.settings.draftType,
        draftXP: state.settings.draftXP,
        phase: state.draft.phase,
        draftCards: state.settings.draftCards,
        deckSize: state.settings.deckSize,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    const draftProgress = calculateDraftProgress({
        cardList: state.draft.cardList,
        removedList: state.draft.removedList,
        phase: state.draft.phase,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    dispatch(clearDraftPool())

    var numToDraw = filteredData.length >= state.settings.draftCount[state.draft.phase-1] ? 
        state.settings.draftCount[state.draft.phase-1] : 
        filteredData.length

    if (numToDraw < 1) {
        dispatch(setInsufficientOptions(true))
    }

    for (let i = 0; i < numToDraw; i++) {
        state = getState()

        const card = DrawCard(filteredData, state.draft.phase, state.draft.mergedList, state.draft.deckModifiers, state.draft.draftPool, draftProgress, draftTarget, state.settings.investigator, state.settings.parallel)

        card.imageLoaded = false
        card.expandedModifiers = 0

        dispatch(addToDraftPool(card))
    }
}

function DrawCard(cardData, phase, mergedList, deckModifiers, draftPool, draftProgress, draftTarget, investigator, parallel) {
    let legal = false
    let randomCard = null

    if (cardData.length === 0) return null

    var tries = 0
    while (!legal && tries < 100) {
        randomCard = weightedCardDraw(cardData)

        const randomCode = randomCard.code
        const existingIndex = (draftPool && draftPool.length > 0) ? draftPool.findIndex(item => item.key === randomCode) : -1

        if (existingIndex < 0) legal = true

        tries++
    }

    // modifiers is the global list of modifiers to apply to every card
    // newModifiers is the list to be displayed for this card
    const newCard = addModifiers(randomCard, phase, deckModifiers, mergedList, draftTarget-draftProgress, investigator, parallel)
        
    return newCard
}

function DraftCard(dispatch, getState, card, filteredData, draftTarget) {
    let state = getState()

    let mergedList = state.draft.mergedList
    let phase = state.draft.phase
    let deckSize = state.settings.deckSize 
    let myriadCount = state.settings.myriadCount
    let draftProgress = state.draft.progress
    const level0Swaps = state.draft.level0Swaps
    const level0Adds = state.draft.level0Adds

    if (card.name === 'Forced Learning') {
        deckSize = deckSize + 15
        dispatch(changeSetting('DeckSize', deckSize))
    }
    if (card.name === 'Underworld Support') {
        deckSize = deckSize - 5
        dispatch(changeSetting('DeckSize', deckSize))

        const cardsToRemove = mergedList.filter(card => card.count > 1)

        cardsToRemove.forEach(item => {
            dispatch(addToRemovedList({ card: item, count: item.count - 1 }))
            if (!isLevel0Build(phase)) dispatch(addLevel0('Removed', item.count - 1))
        })
    }
    if (card.name === 'In the Thick of It') {
        dispatch(addToBuildXPList({ name:'In the Thick of It', value: 3 }))
    }
    if (card.name === 'Ancestral Knowledge') {
        deckSize = deckSize + 5
        dispatch(changeSetting('DeckSize', deckSize))
        dispatch(addLevel0('Ancestral Knowledge', 5))
    }
    if (card.name === 'Versatile') {
        deckSize = deckSize + 5
        dispatch(changeSetting('DeckSize', deckSize))
        dispatch(addLevel0('Versatile', 5))
    }
    if ((phase === DraftPhases.UpgradeLevel0AddPhase || phase === DraftPhases.UpgradePhase) && card.name === 'Adaptable') {
        dispatch(addLevel0('Adaptable', 2))
    }
    if (card.name === 'On Your Own' && card.permanent) {
        const cardsToRemove = mergedList.filter(card => card.slot && card.slot.includes('Ally'))

        cardsToRemove.forEach(item => {
            dispatch(addToRemovedList({ card: item, count: item.count }))
            dispatch(addLevel0('Removed', item.count))
        })

        // if there are 2 of the unexecptional On Your Own, remove 1 (like an upgrade)
        const oyoToRemove = mergedList.filter(card => card.name === 'On Your Own' && card.count > 1)

        oyoToRemove.forEach(item => {
            dispatch(addToRemovedList({ card: item, count: 1 }))
        })
    }
    if (card.name === 'Underworld Market') {
        deckSize = deckSize + 10
        dispatch(changeSetting('DeckSize', deckSize))
        dispatch(addLevel0('Underworld Market', 10))
    }
    if (card.name === 'Ascetic') {
        dispatch(addToBuildXPList({ name:'Ascentic', value: 10 }))
    }

    let addCount = 1

    if (phase === DraftPhases.VersatilePhase) {
        addCount = 1
    }
    else if (!isUpgrade(phase)) {
        if (card.myriad) addCount = myriadCount

//test here for myriad requirement stuff?
//this is still a pain, requiring rework
//I think I'm leaving it unless it becomes an issue, because in normal use it won't come up much
    if (addCount > draftTarget - draftProgress) addCount = draftTarget - draftProgress
        if (addCount < 1) addCount = 1
    }
    else {
        if (card.myriad) addCount = 3
    }

    if (addCount > card.deck_limit) addCount = card.deck_limit

    var removeCount = 1
    if (card.shrewdAnalysis) {
        const upgradeList = filteredData.filter(item => item.name === card.name && item.subname !== 'Unidentified' && item.subname !== 'Untranslated')

        for (let i = 0; i < 2; i++) {
            const index = Math.floor(Math.random() * upgradeList.length)

            var newCard = listCardFromDBData(upgradeList[index], 1)
            newCard.cardModifiers = card.cardModifiers
            newCard.selectedUpgrade = card.selectedUpgrade
            newCard.xpcost = i === 0 ? card.xpcost : 0

            dispatch(addToCardList({ card: newCard, count: 1 }))
        }

        removeCount = 2
    }
    else {
        dispatch(addToCardList({ card: card, count: addCount }))
    }

    if (isCardUpgrade(card.cardModifiers, card.selectedUpgrade)) {
        const upgradeModifier = card.cardModifiers.filter(item => item.name === 'UpgradeOptions')[0].options[card.selectedUpgrade]

        if (!upgradeModifier.keep) {
            const upgradedCards = state.draft.mergedList.filter(uCard => uCard.name === card.name && uCard.xp === upgradeModifier.level)
            if (upgradedCards) dispatch(addToRemovedList({ card: upgradedCards[0], count: removeCount }))
        }
    }

    updateDraftModifiers(card, state.draft.deckModifiers, dispatch)
    
    if (phase === DraftPhases.VersatilePhase) {
        dispatch(draftVersatile())
    }
    else if (isLevel0Upgrade(phase)) {
        const level0List = phase === DraftPhases.UpgradeLevel0SwapPhase ? level0Swaps : level0Adds

        // indicate drafted, starting from the top of the list...
        var undrafted = 0
        for (let i = 0; i < level0List.length; i++) {
            undrafted += level0List[i].count - level0List[i].drafted
        }
        
        if (addCount > undrafted) addCount = undrafted  // just in case

        while (addCount > 0) {
            for (let i = 0; i < level0List.length; i++) {
                if (level0List[i].count > level0List[i].drafted) {
                    const remaining = level0List[i].count - level0List[i].drafted
                    const drafted = addCount > remaining ? remaining : addCount
                    dispatch(draftLevel0(level0List[i].name, drafted))

                    addCount -= drafted
                    break
                }
            }
        }
    }

    if (isLevel0Upgrade(phase) || isUpgrade(phase)) {
        updateDeckRequirements(dispatch, getState)
    }

    addDeckModifier(card, dispatch, getState, removeCount)
    }

function weightedCardDraw(cardData) {
    const maxWeight = cardData[cardData.length-1].weightValue
    const randomValue = Math.floor(Math.random() * maxWeight)
    const weightedIndex = searchWeights(cardData, randomValue)

    return cardData[weightedIndex]
}

function searchWeights(cardData, randomValue) {
    let start = 0
    let end = cardData.length-1
         
    // looking for largest index where randomValue < weightValue
    while (start < end) { 
        let mid = Math.floor((start + end)/2);

        if (randomValue === cardData[mid].weightValue) {
            // not this one, but the next one up
            return mid + 1
        }
        else if (randomValue < cardData[mid].weightValue) {
            if (mid === 0) {
                return 0
            }
            end = mid
        }
        else if (randomValue >= cardData[mid].weightValue) {
            start = mid
        }

        if (end === start + 1) {
            if (randomValue < cardData[start].weightValue) {
                return start
            }
            else {
                return end
            }
        }
    }

    return end
}

export function draftCardFromDBData(card, count) {
    const baseXP = costBase(card)
    const tabooXP = costWithTaboo(card) - baseXP
    const costXP = costWithModifiers(card, card.cardModifiers, card.selectedUpgrade)

    return {
        name: card.name, 
        subname: card.subname, 
        key: card.code, 
        type_code: card.type_code, 
        subtype_code: card.subtype_code, 
        slot: card.slot,
        faction_code: card.faction_code, 
        faction2_code: card.faction2_code, 
        faction3_code: card.faction3_code, 
        deck_limit: card.deck_limit, 
        traits: card.traits, 
        tags: card.tags,
        permanent: card.permanent, 
        exceptional: card.exceptional, 
        myriad: card.myriad, 
        exile: card.exile,
        duplicateKey: card.duplicate_of_code, 
        imagesrc: card.imagesrc,
        url: card.url,
        signature: (card.restrictions && card.restrictions.investigator ? true : undefined),  
        tabooxp: card.tabooxp,
        tabooexceptional: card.tabooexceptional,
        xp: card.xp, 
        xpbase: baseXP, 
        xptaboo: tabooXP, 
        xpcost: costXP, 
        count: count
    }
}

export function listCardFromDraftData(card, count) {
    const baseXP = costBase(card)
    const tabooXP = costWithTaboo(card) - baseXP
    const costXP = costWithModifiers(card, card.cardModifiers, card.selectedUpgrade)

    return {
        name: card.name, 
        subname: card.subname, 
        key: card.key, 
        type_code: card.type_code, 
        subtype_code: card.subtype_code, 
        slot: card.slot,
        faction_code: card.faction_code, 
        faction2_code: card.faction2_code, 
        faction3_code: card.faction3_code, 
        deck_limit: card.deck_limit, 
        traits: card.traits, 
        tags: card.tags,
        permanent: card.permanent, 
        exceptional: card.exceptional, 
        myriad: card.myriad, 
        exile: card.exile,
        duplicateKey: card.duplicate_of_code, 
        imagesrc: card.imagesrc,
        url: card.url,
        signature: (card.restrictions && card.restrictions.investigator ? true : undefined),  
        tabooxp: card.tabooxp,
        tabooexceptional: card.tabooexceptional,
        xp: card.xp, 
        xpbase: baseXP, 
        xptaboo: tabooXP, 
        xpcost: costXP, 
        count: count
    }
}

export function listCardFromDBData(card, count) {
    const baseXP = costBase(card)
    const tabooXP = costWithTaboo(card) - baseXP
    const costXP = costWithModifiers(card, card.cardModifiers, card.selectedUpgrade)

    return {
        name: card.name, 
        subname: card.subname, 
        key: card.code, 
        type_code: card.type_code, 
        subtype_code: card.subtype_code, 
        slot: card.slot,
        faction_code: card.faction_code, 
        faction2_code: card.faction2_code, 
        faction3_code: card.faction3_code, 
        deck_limit: card.deck_limit, 
        traits: card.traits, 
        tags: card.tags,
        permanent: card.permanent, 
        exceptional: card.exceptional, 
        myriad: card.myriad, 
        exile: card.exile,
        duplicateKey: card.duplicate_of_code, 
        imagesrc: card.imagesrc,
        url: card.url,
        signature: (card.restrictions && card.restrictions.investigator ? true : undefined),  
        tabooxp: card.tabooxp,
        tabooexceptional: card.tabooexceptional,
        xp: card.xp, 
        xpbase: baseXP, 
        xptaboo: tabooXP, 
        xpcost: costXP, 
        count: count
    }
}

export function costBase(card) {
    var cost = card.xp

    if (card.exceptional) cost *= 2

    return cost
}

export function costWithTaboo(card) {
    var cost = card.xp

    if (card.tabooxp) cost += card.tabooxp
    if (card.exceptional) cost *= 2
    else if (card.tabooexceptional) cost *= 2

    return cost
}

export function costWithModifiers(card, modifiers, upgradeIndex) {
    var cost = card.xp
    const cardCode = card.code ? card.code : card.key

    if (card.tabooxp) cost += card.tabooxp
    if (card.exceptional) cost *= 2
    else if (card.tabooexceptional) cost *= 2

    if (modifiers) {
        let isUpgrade = false

        const upgradeModifiers = modifiers.filter(item => item.name === 'UpgradeOptions')

        if (upgradeModifiers.length > 0 && upgradeIndex >= 0 && upgradeModifiers[0].options.length > upgradeIndex) {
            const upgradeOptions = upgradeModifiers[0].options[upgradeIndex]

            if (isCardUpgrade(modifiers, upgradeIndex)) {
                isUpgrade = true
                cost += upgradeOptions.modifier
            }
        }

        modifiers.forEach( item => {
            if (item.name !== 'Taboo' && item.name !== 'UpgradeOptions') {
                let replacement = true
                let trait = true
                let upgrade = true
                let limit = true

                let costModifier = item.modifier

                if (item.replacement) {
                    replacement = false

                    Object.keys(item.codes).forEach(code => {
                        if (cardCode === code) {
                            replacement = true
                        }
                    })
                }
                if (item.trait) {
                    trait = false

                    if (card.traits.includes(item.trait)) trait = true
                }
                if (item.upgrade !== undefined) {
                    upgrade = false

                    if (item.upgrade === isUpgrade) upgrade = true
                }
                if (item.limit <= 0) {
                    limit = false
                }

                if (replacement && trait && upgrade && limit) {
                    cost += costModifier
                    if (cost < 0) cost = 0
                }
            }
        })
    }

    return cost
}

export function countList(list) {
    let count = 0

    if (list) {
        list.forEach(item => {
            if (!item.permanent && !item.subtype_code && !item.signature) {
                count += item.count
            }
        })
    }

    return count
}

export function countListInclusive(list) {
    let count = 0

    if (list) {
        list.forEach(item => {
//            if (!item.subtype_code && !item.signature) {
                count += item.count
//            }
        })
    }

    return count
}

export function countListXP(list) {
    let count = 0

    if (list) {
        list.forEach(item => {
            // xpcost is total for all copies...
            count += item.xpcost
        })
    }
    return count
}

export function calculateDraftProgress(props) {
    const { cardList, removedList, phase, level0Swaps, level0Adds } = props

    let draftProgress = 0

    if (isUpgrade(phase)) {
        draftProgress = countListXP(cardList)
    }
    else if (phase === DraftPhases.UpgradeLevel0SwapPhase) {
        draftProgress = level0Swaps.reduce((acc, a) => acc + a.drafted, 0)        
    }
    else if (phase === DraftPhases.UpgradeLevel0AddPhase) {
        draftProgress = level0Adds.reduce((acc, a) => acc + a.drafted, 0)                
    }
    else if (phase === DraftPhases.VersatilePhase) {
        draftProgress = level0Adds.reduce((acc, a) => acc + (a.versatileDrafted !== undefined ? a.versatileDrafted : 0), 0)
    }
    else {
        draftProgress = countList(cardList) - countList(removedList)
    }

    return draftProgress
}

export function calculateDraftTarget(props) {
    const { draftType, draftXP, phase, draftCards, deckSize, level0Swaps, level0Adds } = props

    let draftTarget = 0

    if (isUpgrade(phase)) {
        draftTarget = draftXP
    }
    else if (phase === DraftPhases.UpgradeLevel0SwapPhase) {
        draftTarget = level0Swaps.reduce((acc, a) => acc + a.count, 0)
    }
    else if (phase === DraftPhases.UpgradeLevel0AddPhase) {
        draftTarget = level0Adds.reduce((acc, a) => acc + a.count, 0)
    }
    else if (phase === DraftPhases.VersatilePhase) {
        draftTarget = level0Adds.reduce((acc, a) => acc + (a.versatileCount !== undefined ? a.versatileCount : 0), 0)
    }
    else
    {
        if (draftType === 'phaseDraft') {
            if (phase >= 3) draftTarget = deckSize
            else for (let i = 0; i < phase; i++) draftTarget += draftCards[i]
            
            if (draftTarget > deckSize) draftTarget = deckSize
        }
        else {
            draftTarget = deckSize
        }
    }

    return draftTarget
}

export function calculateModifiedCost(card, phase, deckModifiers, mergedList, maxCost, investigator, parallel) {
    var newModifiers = []

    // taboo
    var xpDiff = card.tabooxp
    if (card.tabooexceptional) {
        if (card.tabooxp) xpDiff = card.tabooxp + (card.xp + card.tabooxp)
    }
    if (xpDiff && xpDiff !== 0) newModifiers.push({ name: 'Taboo', value: xpDiff })

    // Research cards must be upgraded
    const forceUpgrade = (Object.keys(ResearchLogs).indexOf(card.name) >= 0 && card.subname !== 'Untranslated' && card.subname !== 'Unidentified')
    const upgradeInfo = availableUpgrades(card, mergedList, deckModifiers, maxCost, forceUpgrade, investigator, parallel)

    newModifiers.push(upgradeInfo.modifier)
    newModifiers = newModifiers.concat(fillCardModifiers(card, phase, deckModifiers, upgradeInfo.isUpgrade))
    const xpCost = costWithModifiers(card, newModifiers, upgradeInfo.defaultIndex)

    return xpCost
}

function testForAdvance(dispatch, getState) {
    let state = getState()

    let phase = state.draft.phase
    let draftType = state.settings.draftType
    let deckSize = state.settings.deckSize
//    let draftCount = state.settings.draftCount

    var draftFinished = false
    var refillDraft = false

    const draftTarget = calculateDraftTarget({
        draftType: state.settings.draftType,
        draftXP: state.settings.draftXP,
        phase: state.draft.phase,
        draftCards: state.settings.draftCards,
        deckSize: state.settings.deckSize,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    const progress = calculateDraftProgress({
        cardList: state.draft.cardList,
        removedList: state.draft.removedList,
        phase: state.draft.phase,
        level0Swaps: state.draft.level0Swaps,
        level0Adds: state.draft.level0Adds
    })

    if (phase === DraftPhases.BuildUpgradePhase || phase === DraftPhases.UpgradePhase) {
        if (draftType === 'chaos') {
            if (progress >= draftTarget) draftFinished = true
        }      
        else if (draftType === 'draft') {
            if (progress >= draftTarget) draftFinished = true
            else refillDraft = true
        }      
    }
    else {
        if (draftType === 'chaos') {
            if (progress >= draftTarget) draftFinished = true
        }      
        else if (draftType === 'draft') {
            if (progress >= draftTarget) draftFinished = true
            else refillDraft = true
        }
        else if (draftType === 'phaseDraft') {
            if (progress >= deckSize) {
                draftFinished = true
            }
            else if (progress >= draftTarget) {
                if (phase < DraftPhases.BuildPhase3) {
                    phase++

                    dispatch(changePhase(phase))
                    dispatch(clearDraftPool())

                    refillDraft = true
                }
                else {
                    draftFinished = true
                }
            }
//            else if (draftCount[phase-1] > 1) {
            else {
                refillDraft = true
            }
        }
    }

    if (refillDraft) {
        dispatch(fillDraft())
    }
    if (draftFinished) {
        dispatch(advanceDraft(false))
    }
}


function isCardUpgrade(modifiers, upgradeIndex) {
    const upgradeModifier = modifiers.filter(item => item.name === 'UpgradeOptions')[0]

    const isUpgrade = upgradeModifier.options.length > 0 ? (upgradeModifier.options[upgradeIndex].text !== 'None') : false

    return isUpgrade
}

export function canKeepOriginal(card, investigator, parallel) {
    var keepUnupgraded = false

    if (parallel) {
        if (investigator === 'Agnes Baker') {
            if (card.traits && card.traits.includes('Spell')) keepUnupgraded = true;
        }
        else if (investigator === '"Skids" O\'Toole') {
            if (card.traits && (card.traits.includes('Fortune') || card.traits.includes('Gambit'))) keepUnupgraded = true;

        }
    }

    return keepUnupgraded
}

export function isCardLegalBurnOption(card, exileSelection, deckList, burnCards, index) {
    const oindex = index === 1 ? 2 : 1

    let legal = true

    let count = 0
    if (exileSelection[card.key + '_1']) count++
    if (exileSelection[card.key + '_2']) count++
    let needed = calculateNeededExileCheckboxes(card.key, exileSelection, deckList, burnCards)

    if (card.exile && count >= needed) legal = false
    if (exileSelection['08076_' + oindex] && burnCards[oindex-1] === '08076') legal = false
    if (exileSelection['08076_' + oindex] && burnCards[oindex-1] === card.key && card.count < 2) legal = false

    if (index === 1 && (card.permanent || card.subtype_code || card.signature || (card.name === 'Burn After Reading' && card.count === 1))) legal = false
    if (index === 2 && (card.permanent || card.subtype_code || card.signature || card.name === 'Burn After Reading')) legal = false

    // but if it's already selected here, allow it
    if (exileSelection['08076_' + index] && burnCards[index-1] === card.key) legal = true

    return legal
}
