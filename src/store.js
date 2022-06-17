import { configureStore } from '@reduxjs/toolkit'

import settingsReducer from './features/settings/settingsSlice'
import draftReducer from './features/draft/draftSlice'
import dataReducer from './features/data/dataSlice'
import collectionReducer from './features/collection/collectionSlice'

const store = configureStore({
    reducer: {
        settings: settingsReducer,
        draft: draftReducer,
        data: dataReducer,
        collection: collectionReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: { warnAfter: 128 },
        serializableCheck: { warnAfter: 128 }
    })
})

export default store