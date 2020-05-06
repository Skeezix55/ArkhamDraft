import DrawCard from './DraftData'
import FilterCards from './DraftFilters'

function StandardChaos(props) {
    const { draftCards, draftCard, cardList, investigator } = props;
    let newList = []

    newList = newList.concat(cardList)

    let draftProgress = 0;

    while (draftProgress < draftCards) {
        // generates all cards, sets cardList state
        // need to do it each iteration for all investigators whose filter depends on the cards in the deck
        props.cardList = newList
        let filteredData = FilterCards(props)

        const card = DrawCard(filteredData)

        newList = draftCard(card, newList)

//        if (card.traits && card.traits.search(new RegExp('insight', "i")) >= 0)

        if (!card.permanent) draftProgress++

        if (investigator === 'Joe Diamond' || investigator === 'Lola Hayes') {
            props.cardList = newList
            filteredData = FilterCards(props)
        }
    }

    return newList
}

export default StandardChaos