import { countList, countListInclusive, calculateModifiedCost } from '../draft/DrawDraft'
import ResearchLogs from './ResearchLogs'
import DraftPhases, { isLevel0Build, isLevel0Upgrade, isUpgrade } from './DraftPhases'

// card data:
// pack_code
// pack_name
// type_code
        // treachery
        // investigator
        // asset
        // event
        // skill
        // enemy
        // story
        // location
// type_name
// subtype_code
// faction_code
// faction_name
// position
// exceptional
// myriad
// code
// name
// real_name
// subname
// text
// real_text
// quantity
// skill_willpower
// skill_intellect
// skill_combat
// skill_agility
// clues_fixed
// health
// health_per_investigator
// sanity
// deck_limit
// traits
// real_traits
// deck_requirements
// deck_options
// flavor
// illustrator
// is_unique
// exile
// hidden
// permanent
// double_sided
// back_text
// back_flavor
// octgn_id
// url
// imagesrc
// backimagesrc

// slot
    // Hand
    // Accessory
    // Ally
    // Hand x2
    // Arcane
    // Body
    // Tarot
// restrictions
// cost
// xp

// block cards that say only when building deck
function FilterCards(props) {
    const { cardData, investigatorData, parallel, secondaryClass, classChoices, traitChoice, mergedList, phase, filteredResearch, researchSelection, excludeNormalVersatile, deckSize, 
        draftUseLimited, draftProgress, draftXP, draftWeighting, deckModifiers, level0Swaps, level0Adds, collection } = props

//console.log('FILTER')
//console.log(draftUseLimited)
//console.log(phase)
//console.log(mergedList)
    if (!cardData || !investigatorData) return []

    const useLimited = phase >= 1 && phase <= 3 ? draftUseLimited[phase-1] : true

    const deckOptions = investigatorData.deck_options
    const filteredDeck = filterDeckForLimited(mergedList, deckOptions)

    const requirementOptions = extraDeckRequirements({
        investigatorData: investigatorData,
        mergedList: mergedList,
        deckSize: deckSize,
        phase: phase,
        level0Swaps: level0Swaps,
        level0Adds: level0Adds
    })

    const onYourOwnList = mergedList.filter(item => item.name === 'On Your Own')

    let onYourOwn = false 
    for (let i = 0; i < onYourOwnList.length; i++) {
        if (onYourOwnList[i].permanent) onYourOwn = true
    }
    const underworldSupport = mergedList.filter(item => item.name === 'Underworld Support').length

    let minLevel = 0
    let maxLevel = 0

    switch (phase) {
        case DraftPhases.AllCards:
            minLevel = 0
            maxLevel = 10
            break
        case DraftPhases.BuildPhase1:
        case DraftPhases.BuildPhase2:
        case DraftPhases.BuildPhase3:
        case DraftPhases.UpgradeLevel0SwapPhase:
        case DraftPhases.UpgradeLevel0AddPhase:
            minLevel = 0
            maxLevel = 0
            break
        case DraftPhases.BuildUpgradePhase:
        case DraftPhases.UpgradePhase:
            minLevel = 1
            maxLevel = draftXP - draftProgress
            if (maxLevel < 1) maxLevel = 1
            break
        default:
            minLevel = 0
            maxLevel = 0
            break 
    }

    const filteredData = cardData.filter(card => {
        if (card.type_code === 'investigator') return false
        if (card.type_code === 'story') return false
        if (card.type_code === 'location') return false
        if (card.type_code === 'enemy') return false
        if (card.type_code === 'treachery') return false
        if (card.bonded_to) return false

        if (isLevel0Upgrade(phase) && card.permanent) {
//console.log('Reject (Permanent): ' + card.name + ' (' + card.code + ')')
            return false
        }

        // currently means weakness
        if (card.subtype_code) return false

        let xp = 0
        if (card.xp) xp = card.xp
        if (card.tabooxp !== undefined) xp += card.tabooxp
        if (card.exceptional || (card.tabooexceptional !== undefined && card.tabooexceptional)) xp *= 2

        // simple level 0 test here
        if (maxLevel === 0 && xp > 0) return false
        if (xp < minLevel) return false

        if (!isLevel0Build(phase) && isAtDeckCreation(card)) {
//console.log('Reject (Deck creation): ' + card.name + ' (' + card.code + ')')
            return false
        }

        if (card.restrictions && card.restrictions.investigator) return false
        if (!collection[card.pack_code]) return false

//        if (deckList && filteredResearch[card.name]) {
        if (phase !== DraftPhases.AllCards && filteredResearch[card.name]) {
            if (filteredResearch[card.name].draftability < 3) {
//console.log('Reject (Research): ' + card.name + ' (' + card.code + ')')
                return false
            }
            else if (card.subname !== 'Unidentified' && card.subname !== 'Untranslated') {
                if (researchSelection[filteredResearch[card.name].baseCode]) {
                    const baseCards = mergedList.filter(item => item.key === filteredResearch[card.name].baseCode)

                    // no base cards in deck
                    if (baseCards.length <= 0) {
//console.log('Reject (NoUntranslated): ' + card.name + ' (' + card.code + ')')
                        return false
                    }
                }
                else {
//console.log('Reject (ResearchUnchecked): ' + card.name + ' (' + card.code + ')')
                    return false
                }
            }
//          else it's a legal base research            
        }

        if (card.duplicate_of_code) {
            const duplicateID = Object.keys(cardData)
            .filter(key => {
                return cardData[key].code === card.duplicate_of_code
            })[0]

            const duplicateCard = cardData[duplicateID]

            // if the set of the card that this card is duplicating is included, don't include this
            if (collection[duplicateCard.pack_code]) return false
        }

        // restricted list, normal limit test only happens on cards already in deck
        if (card.taboodecklimit !== undefined && card.taboodecklimit === 0) {
//console.log('Reject (Taboo deck limit 0): ' + card.name + ' (' + card.code + ')')
            return false
        }

        if (card.name === 'Underworld Support') {
            // can't draft if this would create too big a deck
            if (draftProgress > deckSize - 5) {
//console.log('Reject (Deck size): ' + card.name + ' (' + card.code + ')')
                return false
            }
        }

        // this isn't right for upgrades yet
        let legal = false
        let rejected = false

        for (let i = 0; i < deckOptions.length; i++) {
            if (deckOptions[i].requirement) continue

            let option = deckOptions[i]
            let optionLegal = false

            if (option.name === 'Trait Choice') {
                const selectedOptions = option.option_select.filter(item => item.name === traitChoice)
                if (selectedOptions.length > 0) option = selectedOptions[0]
            }

            if (testDeckOption(card, option)) {
                optionLegal = true

                if (deckOptions[i].not) {
//console.log('Reject (Not): ' + card.name)
                    rejected = true
                }
                else if (deckOptions[i].limit) {
//                    if (!draftUseLimited) optionLegal = false
                    if (!useLimited) optionLegal = false
                    else {
                        const inDeck = countDeckLimited(filteredDeck, deckOptions[i])

                        if (inDeck >= deckOptions[i].limit) {
//console.log('Reject (Over limited limit): ' + card.name + ' (' + card.code + ')')
                            optionLegal = false
                        }
                    }
                }
            }

            if (optionLegal) legal = true
        }

        if (phase === DraftPhases.VersatilePhase) {
            const versatileOptions = {
                faction: [ 'guardian', 'seeker', 'rogue', 'mystic', 'survivor' ],
                level: { min: 0, max: 0 }
            }

            if (testDeckOption(card, versatileOptions)) {
                if ((legal && excludeNormalVersatile) || rejected) return false
            }
            else {
                return false
            }
        }
        else {
            if (!legal || rejected) return false
        }

        // Discipline doesn't have an entry to differentiate it as a sig card
        if (card.name === 'Discipline') return false

        // can't add ally slot assets with On Your Own (permanent)
        if (onYourOwn && card.slot && card.slot.includes('Ally')) {
//console.log('Reject (On Your Own): ' + card.name)
            return false
        }

        // check to see if there's already max in the deck
        var deckLimit = card.deck_limit
        if (card.taboodecklimit !== undefined) {
            deckLimit = card.taboodecklimit
        }

        // if underworld support has been drafted, duplicates are illegal
        if (underworldSupport) deckLimit = 1

        var quantity = card.quantity

        if (card.pack_code === 'core' && collection['core2'] === 0 && quantity < deckLimit) deckLimit = quantity

        let limited = false
        let upgradeable = false
        let countSum = 0
        let lowestXP = 1000

        let currentCount = mergedList.reduce( (acc, a) => a.key === card.code ? acc + a.count : acc, 0 )

        // always return false if there are already 2 copies of this exact card, even if upgrade is available (can happen in parallel gators)
        if (currentCount >= deckLimit) {
//console.log('Reject (Over deck limit): ' + card.name + ' (' + card.code + ')')
            return false
        }

        // I think all copies by name should count here
        // Empower Self vs. Archive of Conduits, I think Archive style will be more common
        mergedList.forEach(item => {
            if (item.name === card.name && !((card.name === 'Empower Self' || card.name === 'Precious Memento') && card.subname !== item.subname)) {
                countSum += item.count
                if (item.xp < lowestXP) lowestXP = item.xp
            }
        })
            
        if (countSum >= deckLimit) {
//console.log('Over deck limit: ' + card.name + ' (' + card.code + ')')
            limited = true
        }

        // count the permanent On Your Own as an upgrade
        if (card.xp > lowestXP || (card.name === 'On Your Own' && card.exceptional)) {
//console.log('But upgradeable: ' + card.name + ' (' + card.code + ') / ' + card.xp + ' vs. ' + lowestXP)
            upgradeable = true
        }

        if (limited && !upgradeable) {
//console.log('Reject (Over deck limit by name): ' + card.name + ' (' + card.code + ')')
            return false
        }

        // check to see if it passes all required tests
        if (requirementOptions && isLevel0Upgrade(phase)) {
            var sizeNeeded = 0
            var othersNeeded = 0
            const sizeRequirement = requirementOptions.filter(item => item.name.includes('Deck size'))

            if (sizeRequirement.length > 0) sizeNeeded = sizeRequirement[0].requirement - sizeRequirement[0].count

            const otherRequirements = requirementOptions.filter(item => !item.name.includes('Deck size'))
            var level0List = phase === DraftPhases.UpgradeLevel0SwapPhase ? level0Swaps : level0Adds
            const draftTotal = level0List.reduce((acc, a) => acc + a.count - a.drafted, 0)

            if (otherRequirements.length > 0) othersNeeded = otherRequirements.reduce((acc, a) => a.name.length > 0 ? acc + a.requirement - a.count : acc, 0)
            const cardsNeeded = sizeNeeded < draftTotal ? draftTotal : sizeNeeded

//            find deck size requirement, test against sum of others, if greater, no requirement enforced
//            otherwise, go in order
//            if (othersNeeded >= sizeNeeded) {
            if (othersNeeded >= cardsNeeded) {
                for (let i = 0; i < requirementOptions.length; i++) {
                    if (requirementOptions[i].count < requirementOptions[i].requirement) {
                        if (!testDeckOption(card, requirementOptions[i])) {
//console.log('Reject (Failed requirement): ' + card.name + ' (' + card.code + ')')
                            return false
                        }

                        break
                    }
                }
            }
        }

        const modifiedCost = calculateModifiedCost(card, phase, deckModifiers, mergedList, maxLevel, investigatorData.name, parallel)

        if (modifiedCost > maxLevel) {
//console.log('Reject (Cost): ' + card.name + '(' + card.code + ')')
            return false
        }
//console.log('Accept: ' + card.name + '(' + card.code + ')')
        return true
    }).map(card => {    // return new items with only necessary fields so we can add to it
        var restrictions = undefined
        if (card.restrictions) {
            if (card.restrictions.investigator) restrictions = { ...card.restrictions, investigator: { ...card.restrictions.investigator }}
            else card.restrictions = { ...card.restrictions }
        }

        return { 
            name: card.name, 
            subname: card.subname,
            code: card.code,
            type_code: card.type_code,
            subtype_code: card.subtype_code,
            pack_code: card.pack_code,
            slot: card.slot,
            faction_code: card.faction_code,
            faction2_code: card.faction2_code,
            deck_limit: card.deck_limit,
            traits: card.traits,
            text: card.text,
            xp: card.xp,
            permanent: card.permanent,
            exceptional: card.exceptional,
            myriad: card.myriad,
            exile: card.exile,
            tabooxp: card.tabooxp,
            tabooexceptional: card.tabooexceptional,
            duplicate_of_code: card.duplicate_of_code,
            quantity: card.quantity,
            bonded_to: card.bonded_to,
            restrictions: restrictions,
            imagesrc: card.imagesrc,
            octgn_id: card.octgn_id,
            url: card.url
        }
    })

    function filterDeckForLimited(list, options) {
        if (!list) return []

        let filteredDeck = []

        list.forEach(item => {
            let legal = false

            for (let i = 0; i < options.length; i++) {
                if (options[i].limit) continue;

                const optionLegal = testDeckOption(item, options[i])

                if (optionLegal) legal = true
            }

            if (!legal) filteredDeck.push(item)
        })

        return filteredDeck
    }
        
    function countDeckLimited(list, option) {
        let count = 0

        if (list) {
            list.forEach(item => {
                if (testDeckOption(item, option)) {
                    count += item.count
                }
            })
        }

        return count
    }

    function testDeckOption(card, option) {
        let level = true
        let faction = true
        let factionChoice = true
        let trait = true
        let uses = true
        let type = true
        let text = true
    
        if (option.name === 'Secondary Class') {
            factionChoice = false
    
            if (card.faction_code === secondaryClass) {
                factionChoice = true
            }
            if (card.faction2_code === secondaryClass) {
                factionChoice = true
            }
        }

        if (option.name === 'Class Choice') {
            factionChoice = false

            if (card.faction_code === classChoices['faction_1'] || card.faction_code === classChoices['faction_2']) {
                factionChoice = true
            }
            if (card.faction2_code === classChoices['faction_1'] || card.faction2_code === classChoices['faction_2']) {
                factionChoice = true
            }
        }
    
        if (option.faction) {
            faction = false
    
            for (let f = 0; f < option.faction.length; f++) {
                if (card.faction_code === option.faction[f]) {
                    faction = true
                }
                if (card.faction2_code === option.faction[f]) {
                    faction = true
                }
            }
        } 
    
        if (option.level) {
            level = false
    
            const min = option.level.min
            const max = option.level.max
    
            const ixp = card.xp === undefined ? 0 : card.xp
    
            if (ixp >= min && ixp <= max) level = true;
        }
    
        if (option.trait) {
            trait = false
    
            const cardTraits = card.traits

            for (let i = 0; i < option.trait.length; i++) {
                if (cardTraits && cardTraits.search(new RegExp(option.trait[i], "i")) >= 0) {
                    trait = true
                }
            }
        }
    
        if (option.uses) {
            uses = false
    
            const cardText = card.text
    
            if (cardText && cardText.search(new RegExp('Uses \\([0-9\\s]+' + option.uses[0] + '\\)', "i")) >= 0)
                uses = true
        }
    
        if (option.type) {
            type = false
    
            const cardType = card.type_code
    
            if (cardType && option.type.find(item => item === cardType))
                type = true
        }
            
        if (option.text) {
            text = false
            
            if (card.text && card.text.search(new RegExp(option.text, "i")) >= 0)
                text = true
        }

    //console.log(faction + ' ' + level + ' ' + trait + ' ' + uses + ' ' + type + ' ' + secondaryFaction)
        return faction && level && trait && uses && type && factionChoice && text
    }

    calculateWeights(filteredData, draftWeighting)

    return filteredData
}

function calculateWeights(filteredData, draftWeighting) {
    const weightData = {
        'low':    [ 1, 8, 6, 4, 3, 2 ],
        'medium': [ 1, 1, 1, 1, 1, 1 ],
        'high':   [ 1, 2, 3, 4, 6, 8 ]
    }
    var weightSum = 0
    for (let i = 0; i < filteredData.length; i++) {
        const weightArray = weightData[draftWeighting]
        
        if (weightArray) weightSum += weightArray[filteredData[i].xp]
        else weightSum += 1

//if (filteredData[i].traits.includes('Spell')) weightSum += 500
//if (filteredData[i].name === 'Adaptable') weightSum += 500
//if (filteredData[i].subname && filteredData[i].subname.includes('Untranslated')) weightSum += 500

        filteredData[i].weightValue = weightSum
    }
}

export function extraDeckRequirements(props) {
    const { investigatorData, mergedList, phase, deckSize } = props

    // requirement trait: exclude if it doesn't pass a different option AND the requirement
    let requirementOptions = []

    if (investigatorData.name === 'Joe Diamond') {
        const joeRequiredCards = mergedList.filter(item => {
            const cardTraits = item.traits

            if (cardTraits && cardTraits.search(new RegExp('insight', "i")) >= 0)
                return true 

            return false
        })

    const joeCount = countList(joeRequiredCards)
        if (deckSize - countList(mergedList) + joeCount <= 10) {
            requirementOptions.push({
                name: 'Insights',
                count: joeCount,
                requirement: 10,
                trait: ['insight']
            })
        }
    }
    else if (investigatorData.name === 'Lola Hayes') {
        const lolaRequiredCards = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor'].map(faction => {
            return {
                faction: faction,
                count: countListInclusive(mergedList.filter(item => {
                    if (item.faction_code === faction) {
                        return true
                    }
                    if (item.faction2_code === faction) {
                        return true
                    }

                    return false
                }))
            }
        }).sort((e1, e2) => e2.count - e1.count)

        let count = 0
        for (let i = 0; i < 3; i++) {
            count += Math.min(7, lolaRequiredCards[i].count)
        }

        var totalCount
        if (isLevel0Upgrade(phase) || isUpgrade(phase)) totalCount = count
        else totalCount = deckSize - countList(mergedList) + count

        if (totalCount <= 21) {
            const minCount = lolaRequiredCards[2].count

            let factionRequirement = []
            let completeFactions = 0
            let remaining = 0
            
            for (let i = 0; i < 5; i++) {
                if (lolaRequiredCards[i].count >= 7) {
                    completeFactions = completeFactions + 1
                }
                else if (lolaRequiredCards[i].count >= minCount) {
                    factionRequirement.push(lolaRequiredCards[i].faction)
                }
            }

            for (let i = 0; i < 3; i++) {
                if (lolaRequiredCards[i].count < 7) remaining += 7 - lolaRequiredCards[i].count
            }
            
            // used in filtering
            requirementOptions.push({
                name: '',
                requirementName: '',
                count: minCount,
                requirement: 7,
                faction: factionRequirement
            })

            // used in requirements display
            requirementOptions.push({
                name: 'Class (7 cards)',
                requirementName: 'Class',
                count: completeFactions,
                remaining: remaining,
                requirement: 3
            })
        }
    }

    var skillCount = 10
    var ancestral = false

    if (mergedList.filter(item => item.name === 'Ancestral Knowledge').length > 0) {
        ancestral = true

        skillCount = mergedList.reduce( (acc, a) => {
            return a.type_code === 'skill' ? acc + a.count : acc
        }, 0 )
    }

    if (ancestral && skillCount <= 10) {
        requirementOptions.push({
            name: 'Skills',
            requirementName: 'Skills',
            count: skillCount,
            requirement: 10,
            type: ['skill']
        })
    }

    const size = countList(mergedList)

    if (size < deckSize) {
        requirementOptions.push({
            name: 'Deck size',
            requirementName: 'Deck size',
            count: size,
            requirement: deckSize,
            size: true
        })
    }

    // current requirement order os:
    //      Faction
    //      Skill
    //      Deck size
 
    return requirementOptions
}

export default FilterCards
    
/* odds research
            // stat test
            const setArray = [ 'core'
                ,'dwl', 'tmm', 'tece', 'bota', 'uau', 'wda', 'litas'
                ,'ptc', 'eotp', 'tuo', 'apot', 'tpm', 'bsr', 'dca'
                ,'tfa', 'tof', 'tbb', 'hote', 'tcoa', 'tdoy', 'sha'
                ,'tcu', 'tsn', 'wos', 'fgg', 'uad', 'icc', 'bbt'
                ,'tde', 'sfk', 'tsh', 'dsm', 'pnr', 'wgd', 'woc'
                ,'rtnotz', 'rtdwl', 'rtptc'
            ]

//            const assets = countCards('asset', setArray)
//            const events = countCards('event', setArray)
//            const skills = countCards('skill', setArray)

            const hand = countCards('asset', 'Hand', setArray)
            const hands2 = countCards('asset', 'Hand x2', setArray)
            const ally = countCards('asset', 'Ally', setArray)
            const accessory = countCards('asset', 'Accessory', setArray)
            const arcane = countCards('asset', 'Arcane', setArray)
            const body = countCards('asset', 'Body', setArray)
            const tarot = countCards('asset', 'Tarot', setArray)

//            console.log('Assets: ' + assets)
//            console.log('Events: ' + events)
//            console.log('Skills: ' + skills)

            console.log('Hand: ' + hand)
            console.log('Ally: ' + ally)
            console.log('Arcane: ' + arcane)
            console.log('2xHands: ' + hands2)
            console.log('Accessory: ' + accessory)
            console.log('Body: ' + body)
            console.log('Tarot: ' + tarot)
*/
/* odds research
    function countCards(cardType, cardSlot, sets) {
        const filteredData = cardData.filter(card => {
            // currently means weakness
            if (card.type_code !== cardType) return false
            if (card.subtype_code) return false
            if (card.slot && card.slot !== cardSlot) return false
            if (!card.slot) return false
//            if (card.xp && card.xp > 0) return false            
            if (card.restrictions && card.restrictions.investigator) return false
    //        console.log(card.slot + ' <=> ' + cardSlot + ' (' + card.name + ')')
    
            let foundSet = false
            for (let i = 0; i < sets.length; i++) {
                if (card.pack_code === sets[i]) foundSet = true
            }

            return foundSet
        })

        return filteredData.length
    }
*/

export function filteredCount(props) {
    const { filteredData, collection} = props

   let count = 0

    filteredData.forEach( card => {
        if (!card.deck_limit) return

        var cardLimit = card.deck_limit
        var quantity = card.quantity

        if (collection[card.pack_code] === 1) {
            if (card.pack_code === 'core' && collection['core2'] === 0 && quantity < cardLimit) cardLimit = quantity
        }

        count++
    })

    return count
}

export function filterResearch(props) {
    const { filteredData } = props

    var research = {}

    filteredData.forEach( card => {
        if (!card.deck_limit) return

        if (ResearchLogs[card.name]) {
            let researchItem = research[card.name]
            let draftability = researchItem ? researchItem.draftability : 0  
            let code = researchItem ? researchItem.baseCode : card.code

            if (card.subname === 'Unidentified' || card.subname === 'Untranslated') {
                if (researchItem) {
                    draftability = researchItem.draftability + 1
                }
                else {
                    draftability = 1
                    code = card.code
                }
            }
            else {
                if (researchItem) {
                    if (researchItem.draftability < 2) {
                        draftability = researchItem.draftability + 2
                    }
                }
                else {
                    draftability = 2
                    code = card.code
                }
            }

            research[card.name] = { baseCode: code, draftability: draftability }
        }
    })

    return research
}

function isAtDeckCreation(card) {
    switch (card.name) {
        case 'Geared Up':
        case 'Forced Learning':
        case 'Underworld Support':
        case 'Down the Rabbit Hole':
        case 'Short Supply':
        case 'In the Thick of It':
            return true
        default:
            break
    }

    return false
}