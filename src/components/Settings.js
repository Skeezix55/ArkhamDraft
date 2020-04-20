import React from 'react'

import SettingsType from './SettingsType'
import SettingsBuild from './SettingsBuild'
import SettingsUpgrade from './SettingsUpgrade'

function Settings(props) {
    function handleStart(event) {
        props.onChangeSetting('building', true)
    }

    const draftSettings = props.draftTab === 'Build Deck' ?
        <SettingsBuild 
            draftType={props.draftType}
            draftCount={props.draftCount}
            draftCards={props.draftCards}
            deckSize={props.deckSize}
            onChangeSetting={props.onChangeSetting}
        /> :
        <SettingsUpgrade 
            draftType={props.draftType}
            draftWeighting={props.draftWeighting}
            draftXP={props.draftXP}
            draftCount={props.draftCount}
            draftCards={props.draftCards}
            deckSize={props.deckSize}
            onChangeSetting={props.onChangeSetting}
        />

    const button = props.ready ?
    <button className="button-ready" onClick={handleStart}>Start</button> :
    <button className="button-loading">Loading...</button>

    return (
        <div className='settings'>
            <SettingsType draftTab={props.draftTab} onChangeSetting={props.onChangeSetting}/>
            <h3>Draft Options</h3>
            <h5>{props.draftTab}</h5>
            {draftSettings}
            {(props.draftTab === 'Build Deck') ? button : null}
        </div>
    )
}

export default Settings