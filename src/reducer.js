import { combineReducers } from 'redux'

import settingsReducer from './features/settings/settingsSlice'
import draftReducer from './features/draft/draftSlice'
import dataReducer from './features/data/dataSlice'
import collectionReducer from './features/collection/collectionSlice'

const rootReducer = combineReducers({
    settings: settingsReducer,
    collection: collectionReducer,
    draft: draftReducer,
    data: dataReducer
})

export default rootReducer