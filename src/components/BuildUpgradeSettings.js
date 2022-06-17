import React from 'react'
import { useSelector } from 'react-redux'

import UpgradeChaosSettings from './UpgradeChaosSettings'
import UpgradeDraftSettings from './UpgradeDraftSettings'
import DraftPhases from '../data/DraftPhases'

function BuildUpgradeSettings(props) {
    const settings = useSelector(state => state.settings)

    let draftSettings = null

    if (settings.draftType === 'chaos')
        draftSettings = <UpgradeChaosSettings 
            phase={DraftPhases.BuildUpgradePhase}
        />
    else if (settings.draftType === 'draft')
        draftSettings = <UpgradeDraftSettings
            phase={DraftPhases.BuildUpgradePhase}
        />

    return (
        <div>
            {draftSettings}
        </div>
    )
}

export default BuildUpgradeSettings