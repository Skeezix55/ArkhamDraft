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
        draftDescription = <div className="description">
            The draft will proceed through 3 distinct stages.  All stages will draft 
            from the full set of cards available to the chosen investigator.  Each stage 
            will draft a number of cards equal to "Cards selected in this stage", not 
            including Permanent cards.  Each will be selected from a number of cards 
            determined by the "Cards to select from" option.  This allows you to use 
            completely random selection for part of the deck, or use a wider range of 
            choices for part of the deck.
        </div>
    }

    return (
        <div className="offsetDiv">
            <label>Type:</label>
            <select name="draftType" value={props.draftType} onChange={handleChange}>
                <option value="chaos">Standard chaos</option>
                <option value="draft">Simple draft</option>
                <option value="phaseDraft">Draft in stages</option>
            </select>
            {draftSettings}
            {draftDescription}
        </div>
    )
}

export default SettingsBuild