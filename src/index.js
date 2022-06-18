import React from 'react'
//import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArkhamDraft from './ArkhamDraft'
import store from './store'
import { Provider } from 'react-redux'

import { fetchCards, fetchTaboo } from './features/data/dataSlice'
store.dispatch(fetchCards)
store.dispatch(fetchTaboo)
/*
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
        <ArkhamDraft />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
*/
const root = createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
    <Provider store={store}>
        <ArkhamDraft />
    </Provider>
  </React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
