import React from 'react'

function SettingsType(props) {
    let style1 = {}
    let style2 = {}

    if (props.draftTab === 'Build Deck') {
        style1 = {
            backgroundColor: "#ebebeb"
        }
        style2 = {
            backgroundColor: "#bababa",
            borderLeft: "black 2px solid",
            borderBottom: "black 2px solid"
        }
    } else {
        style1 = {
            backgroundColor: "#bababa",
            borderRight: "black 2px solid",
            borderBottom: "black 2px solid"
        }
        style2 = {
            backgroundColor: "#ebebeb"
        }
    }

    function handleClick(event) {
        props.onChangeSetting(event.target.attributes.name.nodeValue, event.target.attributes.value.nodeValue)
    }

    return (
        <div className='draft-type'>
            <div className='type-button' name='draftTab' value='Build Deck' style={style1} onClick={handleClick}>
                Build Deck
            </div>
            <div className='type-button' name='draftTab' value='Upgrade' style={style2} onClick={handleClick}>
                Upgrade
            </div>
        </div>
    )
}

export default SettingsType