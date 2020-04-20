import React from 'react'

function DraftArea(props) {
    const { draftCount, draftPool, draftCard, draftType, phase, cardList, updateCardList, updateDraftPool } = props

    let newList = []
    newList = newList.concat(cardList)

    function handleClick(event) {
        const index = draftPool.findIndex(item => {
            return event.target.src.includes(item.imagesrc)
        })

        const updatedList = draftCard(draftPool[index], newList)

        updateCardList(updatedList)
        updateDraftPool([])
    }

    let images = []

    for (let i = 0; i < draftCount; i++) {
        const imageSrc = "https://www.arkhamdb.com" + draftPool[i].imagesrc
        images.push(<div className="draft-card" key={i}><img className="draft-image" src={imageSrc} alt={draftPool[i].name} onClick={handleClick}/></div>)
    }

    const phaseText = draftType === 'phaseDraft' ? ' - Stage ' + phase : null

    return (
        <div className="settings">
            <h3>Draft{phaseText}</h3>
            <div className='draft-container'>
                {images}
            </div>
            <p>Click image to draft card</p>
        </div>
    )
}

export default DraftArea