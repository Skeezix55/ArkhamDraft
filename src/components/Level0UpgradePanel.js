import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { startDraft } from '../features/draft/draftSlice'

import BuildChaosSettings from './BuildChaosSettings'
import BuildDraftSettings from './BuildDraftSettings'
import DraftPhases from '../data/DraftPhases'

function Level0UpgradePanel(props) {
    const level0Swaps = useSelector(state => state.draft.level0Swaps)
    const level0Adds = useSelector(state => state.draft.level0Adds)
    const level0Requirements = useSelector(state => state.draft.level0Requirements)
    const draftType = useSelector(state => state.settings.draftType)
    const deckLoaded = useSelector(state => state.data.deckLoaded)

    const phase = props.phase

    const dispatch = useDispatch()

    function handleStartDraft() {
        dispatch(startDraft(phase))
    }
    
    if (!deckLoaded) return null

    var level0List = phase === DraftPhases.UpgradeLevel0SwapPhase ? level0Swaps : level0Adds
    const draftTotal = level0List.reduce((acc, a) => acc + a.count - a.drafted, 0)

    if (draftTotal < 1) return null

    let headerText = 'Cards:'
    level0List = level0List.map( (item, index) => {
        let row = null
        if (item.count - item.drafted > 0) {
            row = <div className="fblist" key={index}>
                <label className="fblistleft">{headerText}</label>
                <span className="fblistcenter">
                    <b>{'+' + (item.count - item.drafted)}</b> {item.name}
                </span>
                <span className="fblistright"></span>
            </div>

            headerText = ''
        }

        return row
    })

    const requirementsList = level0Requirements.map( (item, index) => {
            let row = null
        if (item.count - item.drafted > 0) {
            row = <div className="fblist"key={index}>
                <label className="fblistleft">{item.name + ':'}</label>
                <span className='fblistcenter'>
                    {item.drafted + '/' + item.count}
                </span>
                <span className="fblistright"></span>
            </div>
        }

        return row
    })

    let draftSettings = null

    if (draftType === 'chaos') {
        draftSettings = <BuildChaosSettings 
            allowPhased='false'
        />
    }
    else if (draftType === 'draft') {
        draftSettings = <BuildDraftSettings
            phase={phase}
            allowPhased='false'
        />
    }

    const button = <button className="button-rect button-green" onClick={handleStartDraft}>Draft</button>

    return (
        <div className='settingsDiv'>
            <h3>Level 0 Draft Options</h3>
            <h5>Adaptable, Exile replacements, etc.</h5>
            <h2 className="draft-quantity">{draftTotal} card{draftTotal > 1 ? 's' : ''}</h2>
            {draftSettings}
            {level0List}
            { requirementsList.length > 0 ?
                <div>
                    <h3 style={{marginTop: '5px', marginBottom: '-5px' }}>Missing Requirements</h3>
                        {requirementsList}
                </div> : null }
            <div className="description">
                You may draft any allowed level 0 cards (for example Adaptable or Exiled card replacements, 
                or those required by adding Versatile or Ancestral Knowledge) both before and after the main
                upgrade draft.  
            </div>
            {button}
        </div>
    )
}

export default Level0UpgradePanel