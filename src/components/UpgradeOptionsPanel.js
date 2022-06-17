import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { startDraft } from '../features/draft/draftSlice'

import UpgradeChaosSettings from './UpgradeChaosSettings'
import UpgradeDraftSettings from './UpgradeDraftSettings'
import DraftPhases from '../data/DraftPhases'

function UpgradeOptionsPanel(props) {
    const draftType = useSelector(state => state.settings.draftType)

    const draftXP = useSelector(state => state.settings.draftXP)
    const upgradeProgress = useSelector(state => state.draft.upgradeProgress)

    const dispatch = useDispatch()

    function draftClick(event) {
        dispatch(startDraft(DraftPhases.UpgradePhase))
    }

    let draftSettings = null
    let draftDescription = null

    if (draftType === 'chaos') {
        draftSettings = <UpgradeChaosSettings
            phase={DraftPhases.UpgradePhase}
        />
        draftDescription = <div className="description">
            Cards will be randomly chosen one by one from all upgraded cards available to the 
            chosen investigator until the entered number of experience points have been spent.
        </div>
    }
    else if (draftType === 'draft') {
        draftSettings = <UpgradeDraftSettings
            phase={DraftPhases.UpgradePhase}
        />
        draftDescription = <div className="description">
            Select cards one by one from a random display of upgrade cards available to the 
            chosen investigator.  Each card will be selected from a number of cards 
            determined by the "Cards to select from" option.
        </div>
    }

    return (
        <div className="settingsDiv">
            <h3>Upgrade Draft Options</h3>
            <h2 className="draft-quantity">{draftXP - upgradeProgress} XP</h2>
            {draftSettings}
            {draftDescription}
            <button className='button-rect button-green' onClick={draftClick}>Draft</button>
        </div>
        )
}

export default UpgradeOptionsPanel