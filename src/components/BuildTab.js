import React from 'react'
import { useSelector } from 'react-redux'

import BuildChaosSettings from './BuildChaosSettings'
import BuildDraftSettings from './BuildDraftSettings'
import PhasedDraftSettings from './PhasedDraftSettings'
import DraftPhases from '../data/DraftPhases'

function BuildTab(props) {
    const settings = useSelector(state => state.settings)

    let draftSettings
    let draftDescription

    if (settings.draftType === 'chaos') {
        draftSettings = <BuildChaosSettings 
            allowPhased='true'
        />
        draftDescription = <div className="description">
            The original Ultimatum of Chaos rules from the 2017 Invocation Event.  A 
            full deck will be created completely randomly from all cards available to 
            the chosen investigator.
        </div>
    }
    else if (settings.draftType === 'draft') {
        draftSettings = <BuildDraftSettings
            phase={DraftPhases.BuildPhase1}
            allowPhased='true'
        />
        draftDescription = <div className="description">
            Select cards one by one from a random display of cards available to the 
            chosen investigator.  Each card will be selected from a number of cards 
            determined by the "Cards to select from" option.  
        </div>
    }
    else if (settings.draftType === 'phaseDraft') {
        draftSettings = <PhasedDraftSettings />
        draftDescription = <div>
            <div className="description">
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

    return (
        <div>
            {draftSettings}
            {draftDescription}
        </div>
    )
}

export default BuildTab