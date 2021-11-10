import { IKeyValue } from "src/app/shared/Interfaces/ikey-value.interface";
import { Folder } from "../models/folder.model";

export const folderFeatureKey = 'folders'

export interface foldersState {
    readonly folders: Folder[];
    readonly items: IKeyValue[];
}

export const initialFolderState: foldersState = {
    folders: [],
    items: []
}