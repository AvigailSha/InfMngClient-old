import { on, createReducer } from "@ngrx/store";
import { initialFolderState } from "./folders.state";
import { getFolders } from "./folders.actions"

export const foldersReducer = createReducer(
    initialFolderState,
    on( getFolders, () => initialFolderState)
)