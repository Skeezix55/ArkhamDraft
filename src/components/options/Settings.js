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
            draftUseLimited={props.draftUseLimited}
            deckSize={props.deckSize}
            myriadCount={props.myriadCount}
            onChangeSetting={props.onChangeSetting}
        /> :
        <SettingsUpgrade 
            draftType={props.draftType}
            draftWeighting={props.draftWeighting}
            draftXP={props.draftXP}
            draftCount={props.draftCount}
            draftCards={props.draftCards}
            deckSize={props.deckSize}
            myriadCount={props.myriadCount}
            onChangeSetting={props.onChangeSetting}
        />

    const button = props.ready
        ? (props.draftTab === 'Upgrade' || props.filteredCount >= props.deckSize 
            ? <button className="button-rect button-green" onClick={handleStart}>Start</button>
            : <div>
                <br />
                <p style={{color: 'red'}}>There are not enough cards in the selected packs to draft a complete deck.  Add packs in Collection Options.</p>
                <button className="button-rect button-red">Error</button>
              </div>)
        : <button className="button-rect button-red">Loading...</button>

    return (
        <div className='settingsDiv'>
            <SettingsType draftTab={props.draftTab} onChangeSetting={props.onChangeSetting}/>
            <h3>Draft Options</h3>
            <h5>{props.draftTab}</h5>
            {draftSettings}
            {button}
        </div>
    )
}

export default Settings