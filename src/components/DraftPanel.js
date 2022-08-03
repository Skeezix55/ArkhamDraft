import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { advanceDraft, updateUpgradeOption, changeIndex, expandModifiers, minimizeModifiers, holdModifiers, selectDraftCard, changeDraftPoolProperty } from '../features/draft/draftSlice'

import { draftCard, calculateDraftTarget } from '../draft/DrawDraft'
import DraftPhases, { isUpgrade, isLevel0Build } from '../data/DraftPhases'
import ColorForClass from '../data/ClassColors'

function DraftPanel(props) {
    const [imageLoaded, setImageLoaded] = useState([])

    const phase = useSelector(state => state.draft.phase)
    const draftPool = useSelector(state => state.draft.draftPool)
    const draftTab = useSelector(state => state.settings.draftTab)
    const draftProgress = useSelector(state => state.draft.progress)
    const upgradeProgress = useSelector(state => state.draft.upgradeProgress)
    const draftXP = useSelector(state => state.settings.draftXP)
    const deckSize = useSelector(state => state.settings.deckSize)
    const draftCards = useSelector(state => state.settings.draftCards)
    const draftType = useSelector(state => state.settings.draftType)
    const level0Swaps = useSelector(state => state.draft.level0Swaps)
    const level0Adds = useSelector(state => state.draft.level0Adds)
    const level0Requirements = useSelector(state => state.draft.level0Requirements)
    const insufficientOptions = useSelector(state => state.draft.insufficientDraftOptions)
    const requireConfirmation = useSelector(state => state.settings.confirmDraft)
    const selectedDraftCard = useSelector(state => state.draft.selectedDraftCard)
    const currentLevel0Name = useSelector(state => state.draft.currentLevel0Name)
    const deckLoaded = useSelector(state => state.data.deckLoaded)

    const dispatch = useDispatch()

    var displayedBox = false

    // image click
    function handleClick(event) {
        const index = draftPool.findIndex(item => {
            return event.target.src.includes(item.imagesrc)
        })
    
        if (requireConfirmation) {
            dispatch(selectDraftCard(index))
        }
        else {
            draftCardWithIndex({index: index})
        }
    }

    // button click
    function handleDraft(index) {
        draftCardWithIndex({index: index})
    }
    function handleSelect(index) {
        dispatch(selectDraftCard(index))
    }
    function handleUpgradeChange(event) {
        var index = event.target.name.substring(15)

        dispatch(updateUpgradeOption(index, event.target.value))
    }

    function doneClick(event) {
        if (requireConfirmation) dispatch(selectDraftCard(null))
        dispatch(advanceDraft(true))
    }

    function draftCardWithIndex(props) {
        const { index } = props

        dispatch(changeIndex(index))
        dispatch(draftCard())
        setImageLoaded([])
        if (requireConfirmation) dispatch(selectDraftCard(null))
    }

    function expandPanelHover(event) {
        const panelIndex = parseInt(event.currentTarget.id.substring(13))

        if (panelIndex) {
            if (draftPool[panelIndex-1].expandedModifiers === 0) dispatch(expandModifiers(panelIndex-1))
        }
    }
    function minimizePanelHover(event) {
        const panelIndex = parseInt(event.currentTarget.id.substring(13))
        const clickedElement = event.target.nodeName

        if (panelIndex && (clickedElement !== 'SELECT' && clickedElement !== 'INPUT' && clickedElement !== 'OPTION')) {
            if (draftPool[panelIndex-1].expandedModifiers === 1) dispatch(minimizeModifiers(panelIndex-1))
        }
    }
    function expandPanelClick(event) {
        const panelIndex = parseInt(event.currentTarget.id.substring(13))
        const clickedElement = event.target.nodeName

        if (panelIndex && (clickedElement !== 'SELECT' && clickedElement !== 'INPUT' && clickedElement !== 'OPTION')) {
            if (draftPool[panelIndex-1].expandedModifiers === 2) {
                dispatch(minimizeModifiers(panelIndex-1))
            }
            else {
                dispatch(holdModifiers(panelIndex-1))
            }
        }
    }
    function handleCheckbox(event) {
        const panelIndex = parseInt(event.target.name.substring(14))

        dispatch(changeDraftPoolProperty('shrewdAnalysis', panelIndex, event.target.checked))
    }

    function imageDidLoad(props)
    {
        const { index } = props;

        setImageLoaded(prevData => {
            var a = [...prevData]
            a[index] = true
            return a
        })
    }

    let images = []
    let modifierPanels = []
    let draftDivs = []

    let factionCode = ''

    for (let i = 0; i < draftPool.length; i++) {
        if (draftPool[i].faction2_code) factionCode = 'multiclass'
        else factionCode = draftPool[i].faction_code

        const classColor = ColorForClass(factionCode)

        var modifierList = []
        var upgradeSelector = null
        var modifierPanel = <div key={i+1000}></div>
        var researchSelector = null

        if (draftPool[i].expandedModifiers) {
            for (let j = 0; j < draftPool[i].cardModifiers.length; j++) {
                var item = draftPool[i].cardModifiers[j]

                if (item.name === 'UpgradeOptions') {
                    if (item.options.length > 0) {
                        const m = item.options[draftPool[i].selectedUpgrade].modifier
                        const valueText = m >= 0 ? '+' + m : m

                        if (m !== 0) {
                            modifierList.push(
                                <div key={j}>
                                    <label className="modifierleft">Upgrade:</label>
                                    <span className="modifierright"><b>{valueText} XP</b></span>
                                </div>
                            )
                        }
                    }

                    // only display options box if more than 1 option
                    if (item.options.length > 1) {
                        var upgradeList = item.options.map((option, index) => {
                            return <option value={index.toString()} key={index.toString()}>     
                                {option.text}
                                </option>
                        })

                        upgradeSelector = <div className="full-width">
                            <p className="upgrade-header"><b>Upgrade Options</b></p>
                            <select className="upgradeselect" name={"SelectedUpgrade" + i} value={draftPool[i].selectedUpgrade} onChange={handleUpgradeChange}>
                                {upgradeList}
                            </select>
                        </div>
                    }
                }
                else if (item.modifier !== 0) {
                    var valueText = item.modifier > 0 ? '+' + item.modifier : item.modifier
                    modifierList.push(
                        <div key={j}>
                            <label className="modifierleft">{item.name}:</label>
                            <span className="modifierright"><b>{valueText} XP</b></span>
                        </div>
                    )
                }
                else if (item.research && item.shrewd) {
                    researchSelector = <div className="full-width">
                        <p className="upgrade-header"><b>Upgrade Options</b></p>
                        <label className="modifierleft">Shrewd Analysis:</label>
                        <span className="modifierright">
                            <input type="checkbox" className="modifiercheckbox" checked={draftPool[i].shrewdAnalysis ? true : false} name={"shrewdAnalysis" + i} onChange={handleCheckbox}/>
                        </span>
                    </div>
                }
            }

            if (modifierList.length > 0 || upgradeSelector || researchSelector) {
                modifierPanel = <div className="draft-modifiers-expanded" id={"ModifierPanel"+(i+1)} key={i+1000} style={{ backgroundColor: classColor }} onClick={expandPanelClick} onMouseEnter={expandPanelHover} onMouseLeave={minimizePanelHover}>
                    <div className="modifier-panel-div">
                        {modifierList.length > 0 ?
                            <p className="upgrade-header"><b>Cost Modifiers</b></p>
                            : null}
                        {modifierList}
                        {upgradeSelector}
                        {researchSelector}
                    </div>
                </div>

                displayedBox = true
            }
        }
        else {
            var displayModifiers = false

            for (let j = 0; j < draftPool[i].cardModifiers.length; j++) {
                var modifier = draftPool[i].cardModifiers[j]

                if (modifier.name === 'UpgradeOptions') {
                    if (modifier.options.length > 1) {
                        displayModifiers = true
                        break
                    }
                    else if (modifier.options.length > 0 && modifier.options[draftPool[i].selectedUpgrade].modifier !== 0) {
                        displayModifiers = true
                        break
                    }
                }
                else if (modifier.name === 'ResearchOptions') {
                    displayModifiers = true
                }
                else if (modifier.modifier !== 0) {
                    displayModifiers = true
                    break
                }
            }

            if (displayModifiers) {
                modifierPanel = <div className="draft-modifiers-minimized" id={"ModifierPanel"+(i+1)} style={{ backgroundColor: classColor }} key={i+1000} onClick={expandPanelClick} onMouseEnter={expandPanelHover} onMouseLeave={minimizePanelHover}>
                    <div className="modifier-panel-div">
                        <p className="minimized-modifier-cost" style={{padding: '0px'}}><b>{draftPool[i].xpcost}</b></p>
                        <p className="minimized-modifier-xp"><b>XP</b></p>
                    </div>
                </div>

                displayedBox = true
            }
        }

        var draftButton = (requireConfirmation && selectedDraftCard !== i) ?
        <button className='button-rect button-green draft-card-button' onClick={() => { handleSelect(i) }}>Select</button> :
        <button className='button-rect button-green draft-card-button' onClick={() => { handleDraft(i) }}>Draft</button>

        var borderColor = (requireConfirmation && selectedDraftCard === i) ? 'black' : 'transparent'

        if (draftPool[i].imagesrc === undefined) {
            const levelStr = draftPool[i].xp && draftPool[i].xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(draftPool[i].xp)}</span> : null
            images.push(
                <div className="draft-card-loading" key={i} style={{backgroundColor: classColor, border: '1px solid ' + borderColor}}>
                    <h3 className="cardName">{draftPool[i].name}</h3>
                    <span className="cardXP">{levelStr}</span>
                    <span className="imageStatus">Image not available</span>
                    <p className="ADBlink"><a href={draftPool[i].url} target="_blank" rel="noreferrer noopener">View on ArkhamDB</a></p>
                    {draftButton}
                    {modifierPanel}
                </div>
            )
        }
        else {
            let imageSrc = "https://www.arkhamdb.com" + draftPool[i].imagesrc
            if (imageLoaded[i]) {
                    images.push(selectedDraftCard === i ?
                    <div className="draft-card-selected" style={{ backgroundColor: classColor }} key={i}>
                        <img className="draft-image-selected" src={imageSrc} alt={draftPool[i].name} onClick={handleClick} />
                        {draftButton}
                        {modifierPanel}
                    </div> :
                    <div className="draft-card" key={i} style={{zIndex: '1', border: '1px solid ' + borderColor}}>
                        <img className="draft-image" src={imageSrc} alt={draftPool[i].name} onClick={handleClick} />
                        {modifierPanel}
                    </div>
                )            
            }
            else {
                const levelStr = draftPool[i].xp && draftPool[i].xp > 0 ? <span className='xpDots'>{' ' + '\u25CF'.repeat(draftPool[i].xp)}</span> : null
                images.push(
                    <div className="draft-card-loading" key={i} style={{backgroundColor: classColor}}>
                        <h3 className="cardName">{draftPool[i].name}</h3>
                        <p className="cardXP">{levelStr}</p>
                        <p className="imageStatus">Image loading...</p>
                        <p className="ADBlink"><a href={draftPool[i].url} target="_blank" rel="noreferrer noopener">View on ArkhamDB</a></p>
                        {draftButton}
                        <img className="draft-image" style={{visibility: "hidden", position: "absolute"}} src={imageSrc} alt={draftPool[i].name} onLoad={event => imageDidLoad({index: i, event: event})} />
                        {modifierPanel}
                    </div>
                )
            }
        }

        modifierPanels.push(modifierPanel)
    }

    let index = 0
    while(index < images.length) {
        for (let i = 0; i < 3; i++) {
            if (images.length > index+i) draftDivs.push(images[index+i])
            else draftDivs.push(<div key={i+100}></div>)
        }

        index += 3
    }
    
    const draftTarget = calculateDraftTarget({
        draftTab: draftTab,
        draftType: draftType,
        draftXP: draftXP,
        phase: phase,
        deckSize: deckSize,
        draftCards: draftCards,
        level0Swaps: level0Swaps,
        level0Adds: level0Adds,
        level0Requirements: level0Requirements
    })

    const progress = isUpgrade(phase) ? 
        <p className="draft-progress"><b>XP: </b>{draftProgress - upgradeProgress}/{draftTarget - upgradeProgress}</p> :
        <p className="draft-progress"><b>Cards: </b>{draftProgress}/{draftTarget}</p>

    var phaseText = null
    var phaseSubtext = null

    switch (phase) {
        case DraftPhases.BuildPhase1:
        case DraftPhases.BuildPhase2:
        case DraftPhases.BuildPhase3:
            phaseText = 'Deck creation'
            if (draftType === 'phaseDraft') phaseSubtext = ' - Stage ' + phase
            break
        case DraftPhases.BuildUpgradePhase:
            phaseText = 'Deck creation upgrades'
            break
        case DraftPhases.UpgradeLevel0SwapPhase:
            phaseText = 'Level 0 Swaps/Replacements'
            break
        case DraftPhases.UpgradeLevel0AddPhase:
            phaseText = 'Level 0 Additions - ' + currentLevel0Name
            break
        case DraftPhases.UpgradePhase:
            phaseText = 'Deck upgrades'
            break
        case DraftPhases.VersatilePhase:
            phaseText = 'Versatile, any class'
            break
        default:
            phaseText = ''
            break
    }

    const button = (!isLevel0Build(phase) && !(isUpgrade(phase) && !deckLoaded)) || insufficientOptions ? 
        <button className='button-rect button-green' onClick={doneClick}>Done</button> : null

    const optionsWarning = insufficientOptions ? <h3 style={{marginTop: '-10px'}}>There are no remaining legal draft options</h3> : null

    const instructions = insufficientOptions ? null : 
        <p style={{marginTop: '8px'}}>Click image to draft card</p>
    const instructionsBox = insufficientOptions || !displayedBox ? null : 
        <p>Hover over experience modifier box to display details, click to hold open</p>

    return (
        <div className="settingsDiv">
            <h3 style={{marginBottom: '-12px'}}>Draft</h3>
            <h5 style={{marginBottom: '10px'}}>{phaseText}{phaseSubtext}</h5>
            {progress}
            <div className='draft-container'>
                {draftDivs}
            </div>
            {optionsWarning}
            {instructions}
            {instructionsBox}
            {button}
        </div>
    )
}

export default DraftPanel