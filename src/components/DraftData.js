function DrawCard(cardData, draftPool) {
    let legal = false
    let randomCard = null

    if (cardData.length == 0) return null

    while (!legal) {
        randomCard = cardData[Math.floor(Math.random() * cardData.length)]

        const randomCode = randomCard.code
        const existingIndex = (draftPool && draftPool.length > 0) ? draftPool.findIndex(item => item.code === randomCode) : -1
        
        if (existingIndex < 0) legal = true
    }

    return randomCard
}

export default DrawCard