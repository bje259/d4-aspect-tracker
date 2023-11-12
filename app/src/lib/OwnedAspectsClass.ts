import type { OwnedAspect } from './types'

export interface IOwnedAspects {
  length(): number
  valid(): boolean
  getAspectsByName(name: string): OwnedAspect[] | undefined
  addAspect(name: string, aspect: OwnedAspect): void
  // ... any other methods that should be public
}

/**
 * Represents a collection of owned aspects.
 */
export class OwnedAspectsClass implements IOwnedAspects {
  private aspects: { [name: string]: OwnedAspect[] } = {}

  /**
   * Initializes a new instance of the OwnedAspectsClass class.
   * @param ownedAspects The initial owned aspects to populate the collection with.
   */
  constructor(ownedAspects: { [name: string]: OwnedAspect[] }) {
    this.aspects = ownedAspects
  }

  /**
   * Gets the number of owned aspects in the collection.
   * @returns The number of owned aspects in the collection.
   */
  public length(): number {
    return Object.keys(this.aspects).length
  }

  /**
   * Determines whether the collection contains any owned aspects.
   * @returns True if the collection contains any owned aspects; otherwise, false.
   */
  public valid(): boolean {
    return this.length() > 0
  }

  /**
   * Gets the owned aspects with the specified name.
   * @param name The name of the owned aspects to get.
   * @returns The owned aspects with the specified name, or undefined if no owned aspects with that name exist.
   */
  public getAspectsByName(name: string): OwnedAspect[] | undefined {
    return this.aspects[name]
  }

  /**
   * Adds an owned aspect to the collection.
   * @param name The name of the owned aspects to add the aspect to.
   * @param aspect The owned aspect to add to the collection.
   */
  public addAspect(name: string, aspect: OwnedAspect): void {
    if (!this.aspects[name]) {
      this.aspects[name] = []
    }
    this.aspects[name].push(aspect)
  }

  //Method to update the owned aspects to match the data passed as a parameter
  public updateOwnedAspects(ownedAspects: {
    [name: string]: OwnedAspect[]
  }): void {
    this.aspects = ownedAspects
  }

  /**
   * Returns all owned aspects.
   * @returns An object containing all owned aspects.
   */
  public getAllOwnedAspects(): { [name: string]: OwnedAspect[] } {
    return this.aspects
  }

  /**
   * Returns an array of tuples containing the aspect name and its corresponding OwnedAspect objects.
   * @returns An array of tuples containing the aspect name and its corresponding OwnedAspect objects.
   */
  public getAllOwnedAspectsArray(): [string, OwnedAspect[]][] {
    return Object.entries(this.aspects)
  }

  /**
   * Updates the owned aspects array with the given aspects array.
   * @param aspectsArray - An array of tuples containing the name of the aspect and an array of owned aspects.
   * @returns void
   */
  public updateOwnedAspectsArray(
    aspectsArray: [string, OwnedAspect[]][]
  ): void {
    const aspectsObject: { [name: string]: OwnedAspect[] } = {}
    aspectsArray.forEach(([name, aspects]) => {
      aspectsObject[name] = aspects
    })
    this.aspects = aspectsObject
  }
}
