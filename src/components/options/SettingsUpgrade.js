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

    const myriadText = props.myriadCount === '1' ? 'card' : 'cards'

    return (
        <div className="draftsettings">
        <label>Type:</label>
        <span className='draft-option'>
            <select name="draftType" value={props.draftType} onChange={handleChange}>
                <option value="chaos">Standard chaos</option>
                <option value="draft">Simple draft</option>
            </select>
        </span>
        <label>Weighting:</label>
        <span className='draft-option'>
            <select name="draftWeighting" value={props.draftWeighting} onChange={handleChange}>
                <option value="low">Prefer low XP</option>
                <option value="medium">Default</option>
                <option value="high">Prefer high XP</option>
            </select>
        </span>
        <label>XP:</label>
        <span className='draft-option'>
            <input style={{width: '23%'}} name="draftXP" type="number" value={props.draftXP} min="1" onChange={handleChange}></input>
        </span>
        {draftSettings}
    </div>
    )
}

export default SettingsUpgrade