import { setDeckModifiers, changeLimit } from '../features/draft/draftSlice'

import { costWithModifiers, draftCardFromDBData, costBase, canKeepOriginal } from './DrawDraft'
import DraftPhases, { isUpgrade, isLevel0Upgrade } from '../data/DraftPhases'
import ResearchLogs from '../data/ResearchLogs'

export function initDeckModifiers() {
    return function initDeckModifiersThunk(dispatch, getState) {
        const state = getState()

        state.draft.deckList.forEach(item => {
            addDeckModifier(item, dispatch, getState)
        })
    }
}

export function addDeckModifier(card, dispatch, getState, count) {
    const state = getState()
    var modifierList = [ ...state.draft.deckModifiers ]
    const phase = state.draft.phase
    var updated = false

    const existingModifiers = modifierList.filter(item => item.name === card.name)
    const existingModifier = existingModifiers.length > 0 ? { ...existingModifiers[0] } : undefined

    var newModifierList = modifierList.filter(item => item.name !== card.name)

    // this has to be called at the beginning of any draft?
    if (card.name === 'D\u00e9j\u00e0 Vu' && phase === DraftPhases.UpgradePhase) {
        if (existingModifier) {
            let newModifier = cloneModifier(existingModifier)

            newModifier.modifier = existingModifier.modifier - card.count
            newModifier.remainder = newModifier.limit   // if we draft a new Deja Vu, we only get -2 for X times, where X is the current limit
            newModifier.limit = existingModifier.limit + 3*card.count
            newModifierList.push(newModifier)
        }
        else {
            let exile = state.settings.exileSelection
            let exileCodes = {}

            Object.keys(exile).forEach( item => {
                if (exile[item]) {
                    let fields = item.split('_')
                    exileCodes[fields[0]] = exileCodes[fields[0]] ? exileCodes[fields[0]] + 1 : 1
                    // Burn After Reading
                    if (fields[0] === '08076') {
                        let exiledCode = state.settings.burnCards[parseInt(fields[1])-1]
                        exileCodes[exiledCode] = exileCodes[exiledCode] ? exileCodes[exiledCode] + 1 : 1
                    }
                }
            })
    
            // Deja Vu: assume we always use the max discount, limit is the max discount possible
            newModifierList.push({ name: 'D\u00e9j\u00e0 Vu', replacement: true, codes: exileCodes, limit: 3*card.count, modifier: -1*card.count })
        }

        updated = true    
    }
    else if (card.name === 'Arcane Research' && phase === DraftPhases.UpgradePhase) {
        if (existingModifier) {
            let newModifier = cloneModifier(existingModifier)

            newModifier.modifier = existingModifier.modifier - card.count

            newModifierList.push(newModifier)
        }
        else {
            newModifierList.push({ name: 'Arcane Research', upgrade: true, trait: ['Spell'], limit: 1, modifier: -1*card.count })
        }

        updated = true
    }
    else if (card.name === 'Down the Rabbit Hole' && (phase === DraftPhases.UpgradePhase || isLevel0Upgrade(phase))) {
        newModifierList.push({ name: 'Down the Rabbit Hole', upgrade: true, limit: 2, modifier: -1 })
        newModifierList.push({ name: 'Down the Rabbit Hole', upgrade: false, modifier: 1 })
 
        updated = true
    }
    else if (card.name === 'Green Man Medallion' && phase === DraftPhases.UpgradePhase) {
        const modifier = state.settings.otherUpgradeSettings['GMM'] > 0 ? -1*state.settings.otherUpgradeSettings['GMM'] : 0

        if (existingModifier) {
            let newModifier = cloneModifier(existingModifier)

            newModifier.modifier = existingModifier.modifier - modifier
            
            newModifierList.push(newModifier)
        }
        else {
            newModifierList.push({ name: 'Green Man Medallion', limit: 1, modifier: modifier })
        }

        updated = true
    }
    else if (card.name === 'Shrewd Analysis') {
        const researchModifiers = modifierList.filter(item => item.name === "ResearchOptions")
        const researchModifier = researchModifiers.length > 0 ? researchModifiers[0] : undefined

        if (researchModifier) {
            // remove the old one
            newModifierList = modifierList.filter( item => item.name !== 'ResearchOptions')

            let newModifier = cloneModifier(researchModifier)
            newModifier.shrewd = true

            newModifierList.push(newModifier)
        }
        else {
            let newResearch = {}
            newResearch[card.name] = card.count

            newModifierList.push({ name: 'ResearchOptions', research: true, researchNames: {}, modifier: 0, shrewd: true })
        }

        updated = true
    }
    else if (card.name === 'Pelt Shipment' && phase === DraftPhases.UpgradePhase) {
        const modifier = (state.settings.otherUpgradeSettings['Pelt'][0] ? -1 : 0) + (state.settings.otherUpgradeSettings['Pelt'][1] ? -1 : 0)

        if (existingModifier) {
            let newModifier = cloneModifier(existingModifier)

            newModifier.modifier = existingModifier.modifier - modifier
            
            newModifierList.push(newModifier)
        }
        else {
            newModifierList.push({ name: 'Pelt Shipment', limit: 1, modifier: modifier })
        }

        updated = true
    }

    // Research cards
    if (Object.keys(ResearchLogs).indexOf(card.name) >= 0) {
        const researchModifiers = modifierList.filter(item => item.name === "ResearchOptions")
        const researchModifier = researchModifiers.length > 0 ? researchModifiers[0] : undefined

        if (card.subname === 'Untranslated' || card.subname === 'Unidentified') {
            // add to research list
            if (state.settings.filteredResearch[card.name] && state.settings.filteredResearch[card.name].draftability >= 3 && state.settings.researchSelection[state.settings.filteredResearch[card.name].baseCode]) {
                if (researchModifier) {
                    // remove the old one
                    newModifierList = modifierList.filter( item => item.name !== 'ResearchOptions')

                    let existingResearch = researchModifier.researchNames[card.name]
                    let newModifier = cloneModifier(researchModifier)
                    let newResearch = { ...newModifier.researchNames }

                    if (existingResearch) {
                        newResearch[card.name] += card.count
                    }
                    else {
                        newResearch[card.name] = card.count            
                    }
                    newModifier.researchNames = newResearch

                    newModifierList.push(newModifier)
                }
                else {
                    let newResearch = {}
                    newResearch[card.name] = card.count

                    newModifierList.push({ name: 'ResearchOptions', research: true, researchNames: newResearch, modifier: 0 })
                }
            }
        }
        else {
            // remove from researchlist
            if (researchModifier.researchNames[card.name]) {
                let existingResearch = researchModifier.researchNames[card.name]
                if (existingResearch) {
                    // remove the old one
                    newModifierList = modifierList.filter( item => item.name !== 'ResearchOptions')

                    let newModifier = cloneModifier(researchModifier)
                    let newResearch = { ...newModifier.researchNames }
    
                    newResearch[card.name] -= count

                    newModifier.researchNames = newResearch
                    newModifierList.push(newModifier)
                }
            }
        }
            
        updated = true
    }

    if (updated) {
        if (newModifierList) {
            dispatch(setDeckModifiers(newModifierList))
        }
        else {
            dispatch(setDeckModifiers(modifierList))
        }
    }
}

export function addModifiers(card, phase, deckModifiers, mergedList, maxCost, investigator, parallel) {
    var newModifiers = []

    // taboo
    var xpDiff = card.tabooxp ? card.tabooxp : 0
    if (card.tabooexceptional) {
        if (card.tabooxp) xpDiff = card.tabooxp + (card.xp + card.tabooxp)
        else xpDiff = card.xp
    }
    if (xpDiff && xpDiff !== 0) newModifiers.push({ name: 'Taboo', modifier: xpDiff })

    // Research cards must be upgraded
    const forceUpgrade = (Object.keys(ResearchLogs).indexOf(card.name) >= 0 && card.subname !== 'Untranslated' && card.subname !== 'Unidentified')
    const upgradeInfo = availableUpgrades(card, mergedList, deckModifiers, maxCost, forceUpgrade, investigator, parallel)

    newModifiers.push(upgradeInfo.modifier)
    newModifiers = newModifiers.concat(fillCardModifiers(card, phase, deckModifiers, upgradeInfo.isUpgrade))

    const xpCost = costWithModifiers(card, newModifiers, upgradeInfo.defaultIndex)

    var newCard = draftCardFromDBData(card, 1)

    newCard.xpcost = xpCost
    newCard.cardModifiers = newModifiers
    newCard.selectedUpgrade = upgradeInfo.defaultIndex

    return newCard
}

export function updateDraftModifiers(card, deckModifiers, dispatch) {
    if (card.xpcost < card.xp + card.xptaboo) {
        deckModifiers.forEach(item => {
            if (item.limit !== undefined) {
                if (item.name === 'D\u00e9j\u00e0 Vu') {
                    const dejavuDiscount = calculateDiscount(card, card.cardModifiers, 'D\u00e9j\u00e0 Vu')

                    dispatch(changeLimit({ name: item.name, limit: item.limit + dejavuDiscount, dejavu: card.key }))
                }
                else {
                    dispatch(changeLimit({ name: item.name, limit: item.limit - 1 }))
                }
            }
        })
    }
}

function testModifier(card, modifier, isUpgrade) {
    const code = card.code ? card.code : card.key
    let replace = true
    let upgrade = true
    let trait = true
    let uses = true
    let research = true

    if (modifier.limit <= 0) return false

    if (modifier.replacement) {
        replace = false

        if (modifier.codes[code] && modifier.codes[code] > 0) {
            replace = true
        }
    } 

    if (modifier.upgrade !== undefined) {
        upgrade = (modifier.upgrade === isUpgrade)
    }

    if (modifier.trait) {
        trait = false

        const cardTraits = card.traits

        for (let i = 0; i < modifier.trait.length; i++) {
            if (cardTraits && cardTraits.search(new RegExp(modifier.trait[i], "i")) >= 0) {
                trait = true
            }
        }
    }

    if (modifier.research) {
        research = false

        if (card.xp > 0 && modifier.researchNames[card.name] > 1) {
            research = true
        }
    }

    if (modifier.limit < 1) uses = false
                
    return replace && upgrade && trait && research && uses
}

export function fillCardModifiers(card, phase, deckModifiers, upgrade) {
    var cardModifiers = []
    const variableModifiers = [
        'D\u00e9j\u00e0 Vu'
    ]

    for (let i = 0; i < deckModifiers.length; i++) {
        if (deckModifiers[i].level0 || isUpgrade(phase))
        if (testModifier(card, deckModifiers[i], upgrade)) {
            cardModifiers.push(deckModifiers[i])
        }
    }

    for (let i = 0; i < variableModifiers.length; i++) {
        const modifiers = cardModifiers.filter(item => item.name === variableModifiers[i])
        if (modifiers.length > 0) {
            var newModifierList = cardModifiers.filter(item => item.name !== variableModifiers[i])
            var modifier = cloneModifier(modifiers[0])
            const discount = calculateDiscount(card, cardModifiers, variableModifiers[i])

            modifier.modifier = discount

            newModifierList.push(modifier)

            cardModifiers = newModifierList
        }
    }

    return cardModifiers
}

export function availableUpgrades(card, mergedList, deckModifiers, maxCost, forceUpgrade, investigator, parallel) {
    let minimumCost = 1000
    let defaultLevel = -1

    // must upgrade if underworld support
    const underworldSupport = mergedList.reduce( (acc, a) => a.name === 'Underworld Support' ? acc + 1 : acc, 0)

    // all upgrades
    const existingCards = mergedList.filter( item => item.name === card.name ).sort((a, b) => (a.xp > b.xp))
    const upgradeCards = existingCards.filter( item => card.xp - item.xp > 0 )
    const upgradeOptions = upgradeCards.map( (item, index) => {
        // avoids -0
        const modifier = item.xp === 0 ? 0 : (item.exceptional ? -2 * item.xp : -1 * item.xp)

        let cost = costBase(card) + modifier
        for (let i = 0; i < deckModifiers.length; i++) {
            if (testModifier(card, deckModifiers[i], true)) cost += deckModifiers[i].modifier
        }

        if (cost > maxCost) return null

        if (cost < minimumCost) {
            minimumCost = cost
            defaultLevel = item.xp
        }

        return { text: 'Upgrade Level ' + item.xp, level: item.xp, modifier: modifier }
    }).filter(item => item !== null)
    
    const keepOriginal = canKeepOriginal(card, investigator, parallel)

    if (existingCards.length > 0 && keepOriginal) {
        upgradeOptions.unshift( { text: 'Keep original at full cost', modifier: 0, keep: true })
    }

    const count = existingCards.reduce((acc, a) => acc + a.count, 0)

    if (count < card.deck_limit && card.xp <= maxCost && !forceUpgrade && !underworldSupport) {
        upgradeOptions.unshift( { text: 'None', modifier: 0 })

        if (defaultLevel <= 0) {
            let cost = costBase(card)
            for (let i = 0; i < deckModifiers.length; i++) {
                if (testModifier(card, deckModifiers[i], false)) cost += deckModifiers[i].modifier
            }

            if (cost <= minimumCost) {
                minimumCost = cost
                defaultLevel = -1
            }
        }
    }
    
    const defaultIndex = upgradeOptions.findIndex(item => {
        if (item.level === undefined && defaultLevel < 0) return true
        if (item.level === defaultLevel) return true

        return false
    })

    const defaultIsUpgrade = (defaultLevel >= 0)
    
    return { modifier: { name: 'UpgradeOptions', options: upgradeOptions }, defaultIndex: defaultIndex, isUpgrade: defaultIsUpgrade }
}

export function cloneModifier(modifier) {
    var newModifier = { ...modifier }

    if (newModifier.codes) newModifier.codes = { ...modifier.codes }
    if (newModifier.researchNames) newModifier.researchNames = { ...modifier.researchNames }
    
    return newModifier
}

export function calculateDiscount(card, cardModifiers, modifierName) {
    if (!cardModifiers) return 0

    var targetModifier = null

    var cost = card.xp
    if (card.xptaboo) cost += card.xptaboo

    const otherDiscount = cardModifiers.reduce((acc, a) => {
        if (a.name === 'UpgradeOptions') {
            if (card.selectedUpgrade >= 0) return acc + a.options[card.selectedUpgrade].modifier
        }
        else if (a.name === modifierName) targetModifier = a
        else if (a.name !== modifierName) return acc + a.modifier

        return acc
    }, 0)

    if (!targetModifier) return 0

    const targetDiscount =  (cost + otherDiscount > -targetModifier.modifier) ? targetModifier.modifier : -(cost + otherDiscount)

    return targetDiscount
}
