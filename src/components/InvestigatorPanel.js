import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeInvestigatorList, changeSetting, calculateFilteredCount } from '../features/settings/settingsSlice'

function InvestigatorPanel(props) {
    const investigatorData = [
        'Agnes Baker',
        'Agnes Baker (Parallel)',
        'Akachi Onyele',
        'Amanda Sharpe',
        'Amina Zidane',
        '"Ashcan" Pete',
        'Bob Jenkins',
        'Calvin Wright',
        'Carolyn Fern',
        'Carson Sinclair',
        'Charlie Kane',
        'Daisy Walker',
        'Daisy Walker (Parallel)',
        'Daniela Reyes',
        'Darrell Simmons',
        'Dexter Drake',
        'Diana Stanley',
        'Father Mateo',
        'Finn Edwards',
        'Gloria Goldberg',
        'Harvey Walters',
        'Jacqueline Fine',
        'Jenny Barnes',
        'Jim Culver',
        'Joe Diamond',
        'Kymani Jones',
        'Leo Anderson',
        'Lily Chen',
        'Lola Hayes',
        'Luke Robinson',
        'Mandy Thompson',
        'Marie Lambeau',
        'Mark Harrigan',
        'Minh Thi Phan',
        'Monterey Jack',
        'Nathaniel Cho',
        'Norman Withers',
        'Patrice Hathaway',
        'Preston Fairmont',
        'Rex Murphy',
        'Rita Young',
        'Roland Banks',
        'Roland Banks (Parallel)',
        'Sefina Rousseau',
        'Silas Marsh',
        'Sister Mary',
        '"Skids" O\'Toole',
        '"Skids" O\'Toole (Parallel)',
        'Stella Clark',
        'Tommy Muldoon',
        'Tony Morgan',
        'Trish Scarborough',
        'Ursula Downs',
        'Vincent Lee',
        'Wendy Adams',
        'Wendy Adams (Parallel)',
        'William Yorick',
        'Winifred Habbamock',
        'Zoey Samaras'
    ]

    const settings = useSelector(state => state.settings)
    const tabooData = useSelector(state => state.data.tabooData)

    const dispatch = useDispatch()

    const investigatorFull = settings.parallel ? settings.investigator + ' (Parallel)' : settings.investigator

    function handleChange(event) {
        dispatch(changeSetting(event.target.name, event.target.value))
    }

    function handleChangeInvestigator(event) {
        dispatch(changeInvestigatorList(event.target.value))
        dispatch(calculateFilteredCount)
    }

    function handleRandom(event) {
        dispatch(changeInvestigatorList(investigatorData[Math.floor(Math.random() * investigatorData.length)]))
    }

    let secondaryFactionList = null
    let classChoiceList = []
    let deckSizeList = null
    let traitChoiceList = null
    let tabooList = null
    let secondaryClassValue = settings.secondaryClass
    let classChoice1Value = settings.classChoices['faction_1']
    let classChoice2Value = settings.classChoices['faction_2']
    let traitChoiceValue = settings.traitChoice
    let deckSizeValue = settings.selectedDeckSize ? settings.selectedDeckSize : settings.deckSize

    if (settings.investigatorData) {
        const deckOptions = settings.investigatorData.deck_options

        for (let i = 0; i < deckOptions.length; i++) {
            if (deckOptions[i].name === 'Secondary Class')
            {
                const list = deckOptions[i].faction_select

                secondaryFactionList = list.map((item, index) => {
                    return <option value={item} key={index}>
                        {item[0].toUpperCase() + item.slice(1)}
                        </option>
                })
            }
            else if (deckOptions[i].name === 'Class Choice')
            {
                const list = deckOptions[i].faction_select

                classChoiceList[deckOptions[i].id] = list.map((item, index) => {
                    return <option value={item} key={index}>
                        {item[0].toUpperCase() + item.slice(1)}
                        </option>
                })
            }
            else if (deckOptions[i].name === 'Deck Size')
            {
                const list = deckOptions[i].deck_size_select

                deckSizeList = list.map((item, index) => {
                    return <option value={item} key={index}>
                        {item}
                        </option>
                })
            }
            else if (deckOptions[i].name === 'Trait Choice')
            {
                const list = deckOptions[i].option_select

                traitChoiceList = list.map((item, index) => {
                    return <option value={item.name} key={index}>
                        {item.name}
                        </option>
                })
            }
        }
    }

    if (tabooData) {
        tabooList = tabooData.map((item, index) => {
            return <option value={item.id} key={index}>
                {item.date_start}
                </option>
        })

        tabooList.unshift(<option value="None" key="100">
            {"None"}
            </option>)
    }

    const tabooDiv = <div className="fbsetting">
        <label className="fbinvestigatorleft">Taboo list:</label>
        <span className="fbinvestigatorcenter">
            <select className="fbinvestigatorselect" name="SelectedTaboo" value={settings.selectedTaboo} onChange={handleChange}>
                {tabooList}
            </select>
        </span>
        <span className="fbinvestigatorbutton"></span>
    </div>

    const secondaryClassDiv = secondaryFactionList ?
        <div className="fbsetting">
            <label className="fbinvestigatorleft" value={secondaryClassValue}>Secondary class:</label>
            <span className="fbinvestigatorcenter">
                <select className="fbinvestigatorselect" name="SecondaryClass" value={settings.secondaryClass} onChange={handleChange}>
                    {secondaryFactionList}
                </select>
            </span>
            <span className="fbinvestigatorbutton"></span>
        </div>
        :
        null

    const classChoice1Div = classChoiceList['faction_1'] ?
        <div className="fbsetting">
            <label className="fbinvestigatorleft" value={classChoice1Value}>Class choice 1:</label>
            <span className="fbinvestigatorcenter">
                <select className="fbinvestigatorselect" name="ClassChoice1" value={classChoice1Value} onChange={handleChange}>
                    {classChoiceList['faction_1']}
                </select>
            </span>
            <span className="fbinvestigatorbutton"></span>
        </div>
        :
        null

    const classChoice2Div = classChoiceList['faction_2'] ?
        <div className="fbsetting">
            <label className="fbinvestigatorleft" value={classChoice2Value}>Class choice 2:</label>
            <span className="fbinvestigatorcenter">
                <select className="fbinvestigatorselect" name="ClassChoice2" value={classChoice2Value} onChange={handleChange}>
                    {classChoiceList['faction_2']}
                </select>
            </span>
            <span className="fbinvestigatorbutton"></span>
        </div>
        :
        null

    const deckSizeDiv = deckSizeList ?
        <div className="fbsetting">
            <label className="fbinvestigatorleft" value={deckSizeValue}>Deck size:</label>
            <span className="fbinvestigatorcenter">
                <select className="fbinvestigatorselect" name="SelectedDeckSize" value={deckSizeValue} onChange={handleChange}>
                    {deckSizeList}
                </select>
            </span>
            <span className="fbinvestigatorbutton"></span>
        </div>
        :
        null

    const traitChoiceDiv = traitChoiceList ?
        <div className="fbsetting">
            <label className="fbinvestigatorleft" value={traitChoiceValue}>Trait choice:</label>
            <span className="fbinvestigatorcenter">
                <select className="fbinvestigatorselect" name="TraitChoice" value={settings.traitChoice} onChange={handleChange}>
                    {traitChoiceList}
                </select>
            </span>
            <span className="fbinvestigatorbutton"></span>
        </div>
        :
        null

    return (
        <div className="settingsDiv">
            <h3>Investigator Options</h3>
            <div className="fbsetting">
                <label className="fbinvestigatorleft">Investigator:</label>
                <span className="fbinvestigatorcenter">
                    <select className="fbinvestigatorselect" name="investigator" value={investigatorFull} onChange={handleChangeInvestigator}>
                        {investigatorData.map( (name, index) => (
                            <option value={name} key={name}>{name}</option>
                        ))}
                    </select>
                </span>
                <span className="fbinvestigatorbutton"><button id="fbbutton-random" onClick={handleRandom}>Random</button></span>
            </div>
            {secondaryClassDiv}
            {classChoice1Div}
            {classChoice2Div}
            {deckSizeDiv}
            {traitChoiceDiv}
            {tabooDiv}
        </div>
        )
}

export default InvestigatorPanel