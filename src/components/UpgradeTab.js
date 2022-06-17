import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeSetting } from '../features/settings/settingsSlice'

import UpgradeChaosSettings from './UpgradeChaosSettings'
import UpgradeDraftSettings from './UpgradeDraftSettings'
import DraftPhases from '../data/DraftPhases'

function UpgradeTab(props) {
    const settings = useSelector(state => state.settings)
    const deckFetchError = useSelector(state => state.data.deckFetchError)

    const dispatch = useDispatch()

    function handleChange(event) {
        dispatch(changeSetting(event.target.name, event.target.value))
    }

    let draftSettings = null
    let draftDescription = null

    if (settings.draftType === 'chaos') {
        draftSettings = <UpgradeChaosSettings
            phase={DraftPhases.UpgradePhase}
            displayXP='true'
        />
        draftDescription = <div className="description">
            Cards will be randomly chosen from all level 1+ cards available to the 
            chosen investigator until the entered number of experience points have been spent.
        </div>
    }
    else if (settings.draftType === 'draft') {
        draftSettings = <UpgradeDraftSettings
            phase={DraftPhases.UpgradePhase}
            displayXP='true'
        />
        draftDescription = <div className="description">
            <p>Select cards one by one from a random display of level 1+ cards available to the 
            chosen investigator.  Each card will be selected from a number of cards 
            determined by the "Cards to select from" option.</p>
{/*}
            <p>If an upgrade or cost modifier, such as Arcane Research or the selected taboo list, is in effect, the modified experience
            cost will be displayed in the upper right corner of the card.  Hovering over this box will display details and allow you
            to change settings such as whether to upgrade or not.  Clicking the box will keep this box open, even when you are not
    hovering, and clicking again will close it.</p>*/}
        </div>
    }

    const deckError = deckFetchError ? <p style={{color: "red", marginTop: '5px'}}>Error: Deck not found. Currently only unpublished decks can be loaded.<br />
        Make sure the ID is correct and that "Make your decks public"<br />
        is selected in your ArkhamDB settings.</p> : null

    return (
//        <div className="draft-settings">
        <div>
            {draftSettings}
            {draftDescription}
            <br />
            <div>
                <h3>ArkhamDB Import</h3>
                <div className="fbsetting">
                    <label className="fbdeckidleft">ArkhamDB Deck ID:</label>
                    <span className="fbdeckidright">
                        <input style={{width: '40%'}} name="DeckID" type="text" value={settings.deckID} onChange={handleChange}></input>
                    </span>
                </div>
                {deckError}
                <div className="description" style={{marginBottom: '5px'}}>
                    <p style={{marginBottom: '5px'}}>You may now enter an ArkhamDB deck ID to load an existing deck, in order to use cards
                    that take effect during upgrading.  Leaving the deck ID field blank will use the original simple upgrade draft.</p>
                    <p>While upgrading, cards will simply be added to a drafted list as usual.  Any cards removed
                    because of an upgrade or because they were forcibly removed, such as by On Your Own, will appear in a removed cards list.</p>
                </div>
            </div>
        </div>
    )
/*They will not be removed from their original list, to keep the original deck list unchanged, and to keep the record of drafts
                    intact.*/
/*Since there is not a way to import upgraded decks into ArkhamDB, once all cards have been drafted the changes and
                    removals will have to be done manually in ArkhamDB.*/
}

export default UpgradeTab