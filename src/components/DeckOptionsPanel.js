import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeSetting } from '../features/settings/settingsSlice'
import { updateExileRemoval, calculateNeededExileCheckboxes } from '../features/draft/draftSlice'

import { costWithTaboo, isCardLegalBurnOption } from '../draft/DrawDraft'
import ResearchLogs from '../data/ResearchLogs'

function DeckOptionsPanel(props) {

    const deckList = useSelector(state => state.draft.deckList)
    const burnCards = useSelector(state => state.settings.burnCards)
    const exileSelection = useSelector(state => state.settings.exileSelection)
    const researchSelection = useSelector(state => state.settings.researchSelection)
    const otherSettings = useSelector(state => state.settings.otherUpgradeSettings)
    const filteredResearch = useSelector(state => state.settings.filteredResearch)
    const removedCards = useSelector(state => state.settings.removedCards)
    const showDeckOptions = useSelector(state => state.draft.showDeckOptions)
    const draftXP = useSelector(state => state.settings.draftXP)
    const classChoice1Value = useSelector(state => state.settings.classChoices['faction_1'])
    const investigatorData = useSelector(state => state.settings.investigatorData)

    const dispatch = useDispatch()

    function handleChange(event) {
        dispatch(changeSetting(event.target.name, event.target.value))
    }

    function handleCheckbox(event) {
        dispatch(changeSetting(event.target.name, event.target.checked))

        if (event.target.name.substring(0, 13) === 'ExileCheckbox') {
            const exileCode = event.target.name.substring(13, 18)

            if (exileCode === '08076') {    // Burn after reading
                const exileIndex = event.target.name.substring(19, 20)

                dispatch(updateExileRemoval(exileCode, event.target.checked, burnCards[exileIndex-1]))
            }
            else {
                dispatch(updateExileRemoval(exileCode, event.target.checked, null))
            }
        }
    }

    function handleBurnChange(event) {
        const exileIndex = event.target.name.substring(8, 9)
        const burnChecked = exileSelection['08076_' + exileIndex]

        dispatch(changeSetting(event.target.name, event.target.value))

        if (burnChecked) {        
            dispatch(updateExileRemoval(null, false, burnCards[exileIndex-1]))
            dispatch(updateExileRemoval(null, true, event.target.value))
        }
    }

    var exileArray = []
    var greenman = 0

    for (let i = 0; i < deckList.length; i++) {
        if (deckList[i].name === 'Green Man Medallion') greenman += deckList[i].count
        if (deckList[i].exile) exileArray.push(deckList[i])
    }

    exileArray.sort( function(a, b) {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
    })

    const researchArray = Object.entries(filteredResearch).filter(entry => entry[1].draftability >= 3).map(item => item[0]).sort( function(a, b) {
        if (a.baseCode > b.baseCode) return 1
        if (a.baseCode < b.baseCode) return -1
        return 0
    })

    // no options to display
    if (!showDeckOptions) return null

    const disallowBurn1 = (exileSelection['08076_2'] && burnCards[1] === '08076')
    const disallowBurn2 = (exileSelection['08076_1'] && burnCards[0] === '08076')

    // and disallow multiple burns if burned a burn
    const exileCheckboxes = exileArray.map( item => {
        let selectBox1 = null
        let selectBox2 = null

        const checkboxesNeeded = calculateNeededExileCheckboxes(item.key, exileSelection, deckList, burnCards)

        if (item.name === 'Burn After Reading') {
            selectBox1 = checkboxesNeeded > 0 && !disallowBurn1 ? <select className="fbburnselect" name="BurnCard1" value={burnCards[0]} onChange={handleBurnChange}>
                {deckList.map( card => {
                    const legal = isCardLegalBurnOption(card, exileSelection, deckList, burnCards, 1)

                    return legal ? <option value={card.key} key={card.key}>{card.xp > 0 ? card.name + ' (' + card.xp + ')' : card.name}</option> : null
                }).filter( item => item !== null).sort( (a, b) => {
                    return (a.props.children > b.props.children ? 1 : a.props.chidren === b.props.children ? 0 : -1)
                })}
            </select> : null

            selectBox2 = item.count > 1 && !disallowBurn2 && checkboxesNeeded > 1 ? <select className="fbburnselect" name="BurnCard2" value={burnCards[1]} onChange={handleBurnChange}>
                {deckList.map( card => {
                    const legal = isCardLegalBurnOption(card, exileSelection, deckList, burnCards, 2)

                    return legal ? <option value={card.key} key={card.key}>{card.xp > 0 ? card.name + ' (' + card.xp + ')' : card.name}</option> : null
                }).filter( item => item !== null).sort( (a, b) => {
                    return (a.props.children > b.props.children ? 1 : a.props.chidren === b.props.children ? 0 : -1)
                })
            }
            </select> : null
        }  

        if (item.name === 'Burn After Reading') {
            const levelStr = item.xp && item.xp > 0 ? <span className='xpDots xpExileDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null
            const bar2 = item.count > 1 && !disallowBurn2 && checkboxesNeeded > 1 ?
                <div key={item.key + '2'}>
                    <div className="fbexilesetting">
                        <span className="fbexileleft">
                            <input type="checkbox" className="fbexilecheckbox" checked={exileSelection[item.key + '_2'] || false} name={'ExileCheckbox' + item.key + '_2'} onChange={handleCheckbox}/>
                        </span>
                        <label className="fbexileright">{item.name}{levelStr}</label>
                    </div>
                    <div className="fbburnsetting">
                        <span className="fbburnleft"></span>
                        <span className="fbburnright">
                            {selectBox2}
                        </span>
                    </div>
                </div> :
                null

            return (
                <div key={item.key + '1'}>
                    <div className="fbexilesetting">
                        <span className="fbexileleft">
                            <input type="checkbox" className="fbexilecheckbox" checked={exileSelection[item.key + '_1'] || false} name={'ExileCheckbox' + item.key + '_1'} onChange={handleCheckbox}/>
                        </span>
                        <span className="fbexileright">{item.name}{levelStr}</span>
                    </div>
                    <div className="fbburnsetting">
                        <span className="fbburnleft"></span>
                        <span className="fbburnright">
                            {selectBox1}
                        </span>
                    </div>
                    {bar2}
                </div>
            )       
        }

        const levelStr = item.xp && item.xp > 0 ? <span className='xpDots xpExileDots'>{' ' + '\u25CF'.repeat(costWithTaboo(item))}</span> : null

        return (checkboxesNeeded === 0 ? null :
            <div className="fbexilesetting" key={item.key}>
                <span className="fbexileleft">
                    {item.count > 3 && checkboxesNeeded > 3 ? <input type="checkbox" className="fbexilecheckbox" checked={exileSelection[item.key + '_4'] || false} name={'ExileCheckbox' + item.key + '_4'} onChange={handleCheckbox}/> : null}
                    {item.count > 2 && checkboxesNeeded > 2 ? <input type="checkbox" className="fbexilecheckbox" checked={exileSelection[item.key + '_3'] || false} name={'ExileCheckbox' + item.key + '_3'} onChange={handleCheckbox}/> : null}
                    {item.count > 1 && checkboxesNeeded > 1 ? <input type="checkbox" className="fbexilecheckbox" checked={exileSelection[item.key + '_2'] || false} name={'ExileCheckbox' + item.key + '_2'} onChange={handleCheckbox}/> : null}
                    {checkboxesNeeded > 0 ? <input type="checkbox" className="fbexilecheckbox" checked={exileSelection[item.key + '_1'] || false} name={'ExileCheckbox' + item.key + '_1'} onChange={handleCheckbox}/> : null}
                </span>
                <span className="fbexileright">{item.name}{levelStr}</span>
            </div>
        )  
    })

    const factionList = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor']

    const classChoiceList = factionList.map((item, index) => {
        return <option value={item} key={index}>
            {item[0].toUpperCase() + item.slice(1)}
            </option>
    })

    const suziDiv = investigatorData.name === 'Subject 5U-21' ? <div>
        <h4 className="section-header">Subject 5U-21 Options</h4>
        <div className="fbsetting" style={{marginBottom: '15px'}}>
            <label className="fbdraftsettingleft">Upgrade class:</label>
            <span className="fbdraftsettingcenter">
            <select className="fbinvestigatorselect" name="ClassChoice1" value={classChoice1Value} onChange={handleChange}>
                {classChoiceList}
            </select>
            </span>
            <label className="fbdraftsettingright"></label>
        </div>
    </div> : null
    
    const researchCheckboxes = researchArray.length > 0 ? researchArray.map( item => {
        return (
            <div className="fblist" key={item}>
                <span className="fbresearchleft">
                    <input type="checkbox" className="fbresearchcheckbox" checked={researchSelection[filteredResearch[item].baseCode] || false} name={'ResearchCheckbox' + filteredResearch[item].baseCode} onChange={handleChange}/>
                </span>
                <span className="fbresearchright">{item} <i>({ResearchLogs[item]})</i></span>
            </div>
        )   
    }) : null

    const exileDiv = exileCheckboxes.length > 0 ? <div>
        <h4 className="section-header">Exile Options</h4>
        {exileCheckboxes}
        <div className="description" style={{marginBottom: '15px'}}>
            Cards selected here will be added to the removed list and increase the number of level 0 drafts allowed.
        </div>
    </div> : null

    const researchDiv = researchArray.length > 0 ? <div>
        <h4 className="section-header">Researched</h4>
        {researchCheckboxes}
        <div className="description" style={{marginBottom: '15px'}}>
            Upgraded versions of Unidentified or Untranslated assets will only appear in the upgrade draft 
            if the corresponding campaign log entry is selected here.
        </div>
    </div> : null

    const otherDiv = greenman > 0 ? <div>
        <h4 className="section-header">Other Cards</h4>
        <div className="fbsetting">
            <label className="fbdraftsettingleft">Green Man Medallion: </label>
            <span className="fbdraftsettingcenter">
                <input className="fbdraftsettingnumber" name="OtherUpgradeGMM" type="number" value={otherSettings['GMM']} min="1" onChange={handleChange}></input>
            </span>
            <span className="fbdraftsettingright"> XP discount</span>
        </div>
    </div> : null

    const deckMods = <div>
        <h4 className="section-header">Deck Modifications</h4>
        <div className="fbsetting">
            <label className="fbdraftsettingleft">Removed by other game effects: </label>
            <span className="fbdraftsettingcenter">
                <input className="fbdraftsettingnumber" name="RemovedCards" type="number" value={removedCards} min="0" onChange={handleChange}></input>
            </span>
            <span className="fbdraftsettingright"> cards</span>
        </div>
        <div className="description" style={{marginBottom: '10px'}}>
            Use this setting if cards have been removed from your deck by a scenario or other card effect and need to be replaced.
        </div>
    </div>

    return (
        <div className='settingsDiv'>
            <h3>Draft Options</h3>
            <div className="fbsetting" style={{marginBottom: '15px'}}>
                <label className="fbdraftsettingleft">XP:</label>
                <span className="fbdraftsettingcenter">
                    <input className="fbdraftsettingnumber" name="DraftXP" type="number" value={draftXP} min="1" onChange={handleChange}></input>
                </span>
                <label className="fbdraftsettingright"></label>
            </div>
            {suziDiv}
            {exileDiv}
            {researchDiv}
            {otherDiv}
            {deckMods}
        </div>
    )
}

export default DeckOptionsPanel