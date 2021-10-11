import React from 'react'
import ColorForClass from '../ClassColors'

function DraftArea(props) {
    const { draftCount, draftPool, draftCard, draftType, phase, cardList, updateCardList, updateDraftPool } = props

    let newList = []
    newList = newList.concat(cardList)

    function handleClick(event) {
        const index = draftPool.findIndex(item => {
            return event.target.src.includes(item.imagesrc)
        })
    
        draftCardWithIndex({index: index})
    }

    function draftCardWithIndex(props) {
        const { index } = props;

        const updatedList = draftCard(draftPool[index], newList)

        updateCardList(updatedList)
        updateDraftPool([])
    }

    function imageLoaded(props)
    {
        const { index } = props;

        const newPool = [...draftPool]
        newPool[index].imageLoaded = true
        updateDraftPool(newPool)
    }

    let images = []

    let factionCode = ''

    for (let i = 0; i < draftCount; i++) {
        if (draftPool[i].faction2_code) factionCode = 'multiclass'
        else factionCode = draftPool[i].faction_code;

        const classColor = ColorForClass(factionCode)

        if (draftPool[i].imagesrc === undefined) {
            images.push(<div className="draft-card-loading" key={i} style={{backgroundColor: classColor}}><h3>{draftPool[i].name}</h3><p>Image not available</p><p><a href={draftPool[i].url} target="_blank" rel="noreferrer noopener">View on ArkhamDB</a></p><button className='button-rect button-green' onClick={() => { draftCardWithIndex({index: i}) }}>Draft</button></div>)
        }
        else {
            let imageSrc = "https://www.arkhamdb.com" + draftPool[i].imagesrc
            if (draftPool[i].imageLoaded) {
                images.push(<div className="draft-card" key={i}><img className="draft-image" src={imageSrc} alt={draftPool[i].name} onClick={handleClick} /></div>)            
            }
            else {
                images.push(<div className="draft-card-loading" key={i} style={{backgroundColor: classColor}}><h3>{draftPool[i].name}</h3><p>Image loading...</p><p><a href={draftPool[i].url} target="_blank" rel="noreferrer noopener">View on ArkhamDB</a></p><button className='button-rect button-green' onClick={() => { draftCardWithIndex({index: i}) }}>Draft</button><img className="draft-image" style={{visibility: "hidden", position: "absolute"}} src={imageSrc} alt={draftPool[i].name} onLoad={() => imageLoaded({index: i})} /></div>)
            }
        }
    }

    const phaseText = draftType === 'phaseDraft' ? ' - Stage ' + phase : null

    return (
        <div className="settingsDiv">
            <h3>Draft{phaseText}</h3>
            <div className='draft-container'>
                {images}
            </div>
            <p>Click image to draft card</p>
        </div>
    )
}

export default DraftArea