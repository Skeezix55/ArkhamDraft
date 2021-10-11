import React, { useState, useEffect } from 'react'

import './App.css';

import InvestigatorSettings from './components/options/InvestigatorSettings'
import Settings from './components/options/Settings'
import CollectionSettings from './components/options/CollectionSettings'

import Draft from './components/draft/Draft'
import FilterCards from './components/DraftFilters'

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

        return () => window.removeEventListnener("resize", handleResize)
    }, [])

    return windowSize
}

function App(props) {
    let contents = null

    const [overlayImage, updateOverlayImage] = useState(null)
    const [overlayPosition, updateOverlayPosition] = useState('Left"')

    const windowSize = useWindowSize()

    function updateCardOverlay(image, xloc) {
        updateOverlayImage(image)
    
        if (xloc < windowSize['width']/2) updateOverlayPosition('Right')
        else updateOverlayPosition('Left')
    }
    
    let overlay = null

    if (overlayImage) {
        overlay = <div className={"floatingImage"+overlayPosition}><img src={overlayImage} alt="" /></div>
    }

    if (props.fetchError) {
        contents = 
            <div>
                Fetch error!
            </div>
    }
    else if (!props.cardData || !props.tabooData) {
        contents =
            <div style={{marginBottom: "20px"}}>
                Loading...
            </div>
    }
    else if (props.building) {
        contents = 
            <Draft
                draftType={props.draftType}
                draftTab={props.draftTab}
                investigator={props.investigator} 
                parallel={props.parallel}
                secondaryClass={props.secondaryClass} 
                deckSize={props.deckSize}
                draftXP={props.draftXP}
                draftCount={props.draftCount[props.phase-1]}
                draftCards={props.draftCards[props.phase-1]}
                draftProgress={props.draftProgress}
                phase={props.phase}
                cardList={props.cardList}
                cardData={props.cardData}
                collectionSets={props.collectionSets}
                draftPool={props.draftPool}
                draftCard={props.draftCard}
                updateCardList={props.updateCardList}
                updateDraftPool={props.updateDraftPool}
                updateCardOverlay={updateCardOverlay}
                resetApp={props.resetApp}
            />
    }
    else {
        // do we have enough cards??
        var filteredCount = 0

        const filteredCards = FilterCards({
            investigator: props.investigator,
            parallel: props.parallel,
            secondaryClass: props.secondaryClass,
            deckSize: props.deckSize,
            draftCount: props.deckSize,
            draftProgress: 0,
//            draftCount: draftCount[phase-1],
            draftUseLimited: [true, true, true],
            draftXP: props.draftXP,
            upgrade: (props.draftTab === 'Upgrade'),
            cardList: props.cardList,
            cardData: props.cardData,
            collectionSets: props.collectionSets
//            draftCard: draftCard
            })

        filteredCards.forEach( card => {
            if (!card.deck_limit) return
            if (!(card.type_code === 'asset' || card.type_code === 'event' || card.type_code === 'skill')) return
            if (card.subtype_code === 'weakness' || card.subtype_code === 'basicweakness') return
            if (!props.collectionSets[card.pack_code] || props.collectionSets[card.pack_code] === 0) return
            if (card.restrictions) {
                if (card.restrictions['investigator']) return
            }

            var cardLimit = card.deck_limit
            var quantity = card.quantity

            if (props.collectionSets[card.pack_code] === 1) {
                if (card.pack_code === 'core' && props.collectionSets['core2'] === 0 && quantity < cardLimit) cardLimit = quantity
            }

            filteredCount += cardLimit
        })

        // there has to be enough extra to allow for a final card choice
        if (props.draftType === 'chaos') filteredCount -= 2
        else filteredCount -= 30    // max of 15 draft options * counting 2 each in filteredCount

        contents = 
        <div>
            <InvestigatorSettings 
                investigator={props.investigator}
                parallel={props.parallel}
                secondaryClass={props.secondaryClass}
                selectedDeckSize={props.selectedDeckSize}
                selectedTaboo={props.selectedTaboo}
                deckSize={props.deckSize}
                cardData={props.cardData}
                tabooData={props.tabooData}
                onChangeSetting={props.handleChange}
                onChangeInvestigator={props.handleChangeInvestigator}
            />
            <CollectionSettings 
                expandCollection={props.expandCollection}
                collectionSets={props.collectionSets}
                onChangeSetting={props.handleChange}
            />
            <Settings
                draftTab={props.draftTab}
                draftType={props.draftType}
                draftWeighting={props.draftWeighting}
                draftXP={props.draftXP}
                draftCount={props.draftCount}
                draftCards={props.draftCards}
                draftUseLimited={props.draftUseLimited}
                deckSize={props.deckSize}
                ready={props.ready}
                filteredCount={filteredCount}
                myriadCount={props.myriadCount}
                onChangeSetting={props.handleChange}
            />
        </div>
    }

    return (
        <div className="App">
            <header className="App-header">
            ArkhamDraft
            </header>
            {contents}
            {overlay}
            <div className="copyright" style={{padding: "5px", boxSizing: "border-box"}}>
                Arkham Horror: The Card Game and all information presented here, both literal and graphical, is copyrighted by Fantasy Flight Games. This website is not produced, endorsed, supported, or affiliated with Fantasy Flight Games.
            </div>
        </div>
    )
}

export default App;
