import React from 'react'

import SettingsChaos from './SettingsChaos'
import SettingsDraft from './SettingsDraft'

function SettingsUpgrade(props) {
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

        return (
/*
            <div>
                Unfinished.
            </div>
        )
*/
        <div className="offsetDiv">
            <label>Type:</label>
            <select name="draftType" value={props.draftType} onChange={handleChange}>
                <option value="chaos">Standard chaos</option>
                <option value="draft">Simple draft</option>
            </select>
            <label>Weighting:</label>
            <select name="draftWeighting" value={props.draftWeighting} onChange={handleChange}>
                <option value="low">Prefer low XP</option>
                <option value="medium">Default</option>
                <option value="high">Prefer high XP</option>
            </select>
            <label>XP:</label>
            <input name="draftXP" type="number" value={props.draftXP} min="1" onChange={handleChange}></input>
            {draftSettings}
        </div>
        )
}

export default SettingsUpgrade