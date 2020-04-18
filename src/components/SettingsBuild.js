import React from 'react'

import SettingsChaos from './SettingsChaos'
import SettingsDraft from './SettingsDraft'
import SettingsPhasedDraft from './SettingsPhasedDraft'

function SettingsBuild(props) {
    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    let draftSettings

    if (props.draftType === 'chaos') draftSettings = <SettingsChaos 
            onChangeSetting={props.onChangeSetting}
        />
    else if (props.draftType === 'draft') draftSettings = <SettingsDraft
            draftCount={props.draftCount[0]} 
            onChangeSetting={props.onChangeSetting}
        />
    else if (props.draftType === 'phaseDraft') draftSettings = <SettingsPhasedDraft
            draftCount={props.draftCount} 
            draftCards={props.draftCards} 
            deckSize={props.deckSize} 
            onChangeSetting={props.onChangeSetting}
        />

    return (
        <div>
            <label>Type:</label>
            <select name="draftType" value={props.draftType} onChange={handleChange}>
                <option value="chaos">Standard chaos</option>
                <option value="draft">Simple draft</option>
                <option value="phaseDraft">Phased draft</option>
            </select>
            {draftSettings}
        </div>
    )
}

export default SettingsBuild