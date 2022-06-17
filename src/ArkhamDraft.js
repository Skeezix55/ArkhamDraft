// known issues:
//   Exporting parallel gators (uses regular gator, causing illegal decks) - seems like ArkhamDB is not handling this great
//   level 0 requirements with myriad can result on too many cards being added

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { reset } from './features/settings/settingsSlice'

import InvestigatorPanel from './components/InvestigatorPanel'
import CollectionPanel from './components/CollectionPanel'
import SettingsPanel from './components/SettingsPanel'
import InvestigatorDraftPanel from './components/InvestigatorDraftPanel'
import DraftPanel from './components/DraftPanel'
import CardListPanel from './components/CardListPanel'
import ExportPanel from './components/ExportPanel'
import UpgradeOptionsPanel from './components/UpgradeOptionsPanel'
import BuildUpgradePanel from './components/BuildUpgradePanel'
import Level0UpgradePanel from './components/Level0UpgradePanel'
import VersatilePanel from './components/VersatilePanel'
import DeckOptionsPanel from './components/DeckOptionsPanel'
import DraftPhases from './data/DraftPhases'

import './ArkhamDraft.css';

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({width: undefined, height: undefined})

    useEffect( () => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener("resize", handleResize)

        handleResize()

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowSize
}

function ArkhamDraft() {
    const [expandCollection, changeExpandCollection] = useState(false)

    const windowSize = useWindowSize()
    const overlayImage = useSelector(state => state.settings.imagesrc)
    const overlayX = useSelector(state => state.settings.imagepos)

    let overlay = null

    if (overlayImage) {
        const overlayPosition = (overlayX < windowSize['width']/2) ? 'Right' : 'Left'
    
        overlay = <div className={"floatingImage"+overlayPosition}><img src={overlayImage} alt="" /></div>
    }

    const cardData = useSelector(state => state.data.cardData)
    const tabooData = useSelector(state => state.data.tabooData)
    const fetchError = useSelector(state => state.data.fetchError)

    const draftTab = useSelector(state => state.settings.draftTab)
    const cardList = useSelector(state => state.draft.cardList)
    const removedList = useSelector(state => state.draft.removedList)
    const drafting = useSelector(state => state.settings.drafting)
    const draftComplete = useSelector(state => state.settings.complete)
    const deckLoaded = useSelector(state => state.data.deckLoaded)
    const deckList = useSelector(state => state.draft.deckList)
    const buildXPList = useSelector(state => state.draft.buildXPList)

    const dispatch = useDispatch()

    function resetApp() {
        dispatch(reset())
    }

    const resetButton = <button className='button-rect button-green' onClick={resetApp}>Restart</button>

    let contents = null

    if (fetchError) {
        contents = 
            <div className='mb10'>
                <p>Fetch error!</p>
            </div>
    }
    else if (!cardData || !tabooData) {
        contents =
            <div className='mb10'>
                <p>Loading...</p>
            </div>
    }
    else if (drafting) {
        contents = 
        <div>
            <InvestigatorDraftPanel />
            {deckList.length > 0 ? <CardListPanel 
                list={deckList}
                deck={true}
            /> : null}
            <DraftPanel />
            <CardListPanel 
                list={cardList}
            />
            {removedList.length > 0 ? <CardListPanel
                list={removedList}
                removed={true}
            /> : null}
            {resetButton}
        </div>
    }
    else if (draftComplete) {
        contents = <div>  
            <InvestigatorDraftPanel />
            {deckList && deckList.length > 0 ? <CardListPanel
                list={deckList}
                deck={true}
            /> : null}
            <Level0UpgradePanel phase={DraftPhases.UpgradeLevel0SwapPhase} />
            <Level0UpgradePanel phase={DraftPhases.UpgradeLevel0AddPhase} />
            <VersatilePanel />
            {buildXPList.length > 0 ? <BuildUpgradePanel /> : null}
            <CardListPanel 
                list={cardList}
            />
            {removedList.length > 0 ? <CardListPanel
                list={removedList}
                removed={true}
            /> : null}
            {draftTab === 'Build Deck' ? <ExportPanel /> : null}
            {resetButton}
        </div>
    }
    else if (deckLoaded) {
        contents = 
        <div>  
            <InvestigatorDraftPanel />
            <CardListPanel 
                list={deckList}
                deck={true}
            />
            <DeckOptionsPanel />
            <Level0UpgradePanel phase={DraftPhases.UpgradeLevel0SwapPhase} />
            <Level0UpgradePanel phase={DraftPhases.UpgradeLevel0AddPhase} />
            <VersatilePanel />
            <UpgradeOptionsPanel />
            {cardList.length > 0 ? <CardListPanel
                list={cardList}
            /> : null}
            {removedList.length > 0 ? <CardListPanel
                list={removedList}
                removed={true}
            /> : null}
            {resetButton}
        </div>
    }
    else {
        contents = 
        <div>  
            <InvestigatorPanel />
            <CollectionPanel
                expandCollection={expandCollection}
                doExpandCollection={changeExpandCollection}
            />
            <SettingsPanel />
        </div>
    }

    return (
        <div className="App">
            <header className="App-header">
                ArkhamDraft
            </header>
            {contents}
            {overlay}
            <div className="copyright">
                Bug reports and feedback to: Discord: jaqenZann#6463, Reddit: u/jaqenZann, BGG: Skeezix55
            </div>
            <div className="copyright">
                Arkham Horror: The Card Game and all information presented here, both literal and graphical, is
                copyrighted by Fantasy Flight Games. This website is not produced, endorsed, supported, or affiliated
                with Fantasy Flight Games.
            </div>
        </div>
    )
}

export default ArkhamDraft;
