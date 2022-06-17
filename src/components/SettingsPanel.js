import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeSetting } from '../features/settings/settingsSlice'
import { fetchDeck, changeDeckLoading } from '../features/data/dataSlice'
import { startDraft, changePhase } from '../features/draft/draftSlice'

import BuildTab from './BuildTab'
import UpgradeTab from './UpgradeTab'
import DraftPhases from '../data/DraftPhases'

function SettingsPanel(props) {
    const settings = useSelector(state => state.settings)
    const deckLoading = useSelector(state => state.data.deckLoading)

    const dispatch = useDispatch()

    function handleTabClick(event) {
        dispatch(changeSetting('Tab', event.target.attributes.value.nodeValue))
        dispatch(changePhase(event.target.attributes.value.nodeValue === 'Build Deck' ? DraftPhases.BuildPhase1 : DraftPhases.UpgradePhase))
    }

    function handleStartDraft() {
        if (settings.draftTab === 'Upgrade' && settings.deckID) {
            dispatch(changeDeckLoading(true))
            dispatch(fetchDeck)
        }
        else {
            if (settings.draftTab === 'Upgrade') {
                dispatch(startDraft(DraftPhases.UpgradePhase))
            }
            else {
                dispatch(startDraft(DraftPhases.BuildPhase1))
            }
        }
    }

    const buildTabStyle = settings.draftTab === 'Build Deck' ? 'build-selected' : 'build-unselected'
    const upgradeTabStyle = settings.draftTab === 'Build Deck' ? 'upgrade-unselected' : 'upgrade-selected'

    const draftSettings = settings.draftTab === 'Build Deck' ?
        <BuildTab phase={DraftPhases.BuildPhase1} /> :
        <UpgradeTab />

    const button = !deckLoading
        ? (settings.draftTab === 'Upgrade' || (settings.filteredCount - 2)*2 > settings.deckSize      // eh, approximate, assume 2 copies of each, want at least 2 extra 
            ? <button className="button-rect button-green" onClick={handleStartDraft}>Start</button>
            : <div>
                <br />
                <p style={{color: 'red'}}>There are not enough cards in the selected packs to draft a complete deck.  Add packs in Collection Options.</p>
                <button className="button-rect button-red">Error</button>
              </div>)
        : <button className="button-rect button-red">Loading...</button>

    return (
        <div className='settingsDiv'>
            <div className='draft-tabs'>
                <div className={'tab-button ' + buildTabStyle} name='buildTab' value='Build Deck' onClick={handleTabClick}>
                    Build Deck
                </div>
                <div className={'tab-button ' + upgradeTabStyle} name='upgradeTab' value='Upgrade' onClick={handleTabClick}>
                    Upgrade
                </div>
            </div>
            <h3>Draft Options</h3>
            <h5>{settings.draftTab}</h5>
            {draftSettings}
            {button}
        </div>
    )
}

export default SettingsPanel