import React from 'react'

import SettingsChaos from './SettingsChaos'
import SettingsDraft from './SettingsDraft'
import SettingsPhasedDraft from './SettingsPhasedDraft'

function SettingsBuild(props) {
    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    let draftSettings
    let draftDescription

    if (props.draftType === 'chaos') {
        draftSettings = <SettingsChaos 
            onChangeSetting={props.onChangeSetting}
        />
        draftDescription = <div className="description">
            The original Ultimatum of Chaos rules from the 2017 Invocation Event.  A 
            full deck will be created completely randomly from all cards available to 
            the chosen investigator.
        </div>
    }
    else if (props.draftType === 'draft') {
        draftSettings = <SettingsDraft
            draftCount={props.draftCount[0]} 
            onChangeSetting={props.onChangeSetting}
        />
        draftDescription = <div className="description">
            Select cards one by one from a random display of cards available to the 
            chosen investigator.  Each card will be selected from a number of cards 
            determined by the "Cards to select from" option.  
        </div>
    }
    else if (props.draftType === 'phaseDraft') {
        draftSettings = <SettingsPhasedDraft
            draftCount={props.draftCount} 
            draftCards={props.draftCards}
            draftUseLimited={props.draftUseLimited}
            deckSize={props.deckSize} 
            onChangeSetting={props.onChangeSetting}
        />
        draftDescription = <div><div className="description">
                The draft will proceed through 3 distinct stages.  All stages will draft 
                from the full set of cards available to the chosen investigator.  Each stage 
                will draft a number of cards equal to "Cards selected in this stage", not 
                including Permanent cards.  Each will be selected from a number of cards 
                determined by the "Cards to select from" option.  This allows you to use 
                completely random selection for part of the deck, or use a wider range of 
                choices for part of the deck.
            </div>
            <div className="description"><b>Note:</b> Once the number of cards specified in the options have been drafted, 
                if additional cards are necessary for a legal deck, they will be drafted using the settings for phase 3.  
                If the required number of cards is reached before any phase is completed, the draft will end immediately.
            </div>
        </div>

    }

    const myriadText = props.myriadCount === '1' ? 'card' : 'cards'

    return (
        <div className="draftsettings">
            <label>Type:</label>
            <span className='draft-option'>
                <select name="draftType" value={props.draftType} onChange={handleChange}>
                    <option value="chaos">Standard chaos</option>
                    <option value="draft">Simple draft</option>
                    <option value="phaseDraft">Draft in stages</option>
                </select>
            </span>
            <label>Drafting myriad adds:</label>
            <span className='draft-option'>
                <select style={{width: '25%'}} name="myriadCount" value={props.myriadCount} onChange={handleChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
                <label style={{textAlign: "left"}}> {myriadText}</label>
            </span>
            {draftSettings}
            {draftDescription}
        </div>
    )
}

export default SettingsBuild