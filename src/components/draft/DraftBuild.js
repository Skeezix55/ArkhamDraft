import React from 'react'

import CardList from './CardList'
import DraftArea from './DraftArea'

function DraftBuild(props) {
    const { investigator, parallel, deckSize, draftCount, cardCount, draftType, phase, cardList, draftPool, cardData, draftCard, updateCardList, updateDraftPool, resetApp } = props

    let investigatorCardImage = null
    let investigatorCardImageBack = null

    if (cardData) {
        const investigatorID = Object.keys(cardData)
        .filter(key => {
//            return  cardData[key].name === investigator
            return cardData[key].name === investigator && (parallel ? typeof cardData[key].alternate_of_name !== 'undefined' : true)
        })[0]

        const imagesrc = "https://www.arkhamdb.com" + cardData[investigatorID].imagesrc
        const backimagesrc = "https://www.arkhamdb.com" + cardData[investigatorID].backimagesrc
        investigatorCardImage = <img className="investigator-image" src={imagesrc} alt={props.investigator} />
        investigatorCardImageBack = <img className="investigator-image" src={backimagesrc} alt={props.investigator + ' (back)'} />
    }

    let draftContent = null

    if (draftPool.length > 0) {
        draftContent = <DraftArea 
            draftCount={draftCount}
            draftCard={draftCard}
            phase={phase}
            draftType={draftType}
            draftPool={draftPool}
            cardList={cardList}
            updateCardList={updateCardList}
            updateDraftPool={updateDraftPool}
        />
    }

    return (
        <div>
            <div className="settings draftHeaderSettings">
                <h2>{investigator}</h2>
                <br />
                {investigatorCardImage}
                {investigatorCardImageBack}
                <p><b>Cards: </b>{cardCount}/{deckSize}</p>
            </div>
            {draftContent}
            <CardList 
                cardList={cardList}
            />
            <button className='button-rect button-green' onClick={resetApp}>Restart</button>
        </div>
    )
}

export default DraftBuild