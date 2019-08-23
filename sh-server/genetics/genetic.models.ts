import { Tag, AssignmentImportance } from "../models/models";

export class Condition
{
    constructor(public tag: Tag,public amount: number, public importance: AssignmentImportance)
    {
    }
}