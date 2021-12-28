/**
 * A song duration implementation
 */
export class Duration {
    _hours: number = 0;
    _minutes: number = 0;
    _seconds: number = 0;
    durationFormatted: string;

    public constructor();
    public constructor(seconds: number);
    public constructor(seconds: number, minutes: number);
    public constructor(seconds: number, minutes: number, hours: number);
    public constructor(seconds = 0, minutes = 0, hours = 0) {
        this._hours = hours;
        this.setMinutes(minutes);
        this.setSeconds(seconds);
        this.durationFormatted =
            this._hours === 0
                ? `${this._hours} 
            + ":" + ${this._minutes} 
            + ":" + ${this._seconds}`
                : `${this._minutes} 
            + ":" ${this._seconds}`;
    }

    get hours(): number {
        return this._hours;
    }

    get minutes(): number {
        return this._minutes;
    }

    get seconds(): number {
        return this._seconds;
    }

    /**
     * Set the number of seconds
     *
     * @remarks
     * If the parameter is outside the (0-60) range, ```setSeconds()``` attempts
     * to update the Duration object accordingly
     *
     * @param sec The seconds specified
     * @returns The number of seconds
     */
    public setSeconds(sec: number): number {
        if (this._seconds >= 0 && this._seconds < 60) {
            return this._seconds;
        }
        if (this._seconds >= 60) {
            this._minutes++;
            return this.setSeconds(sec - 60);
        } else {
            this._minutes--;
            return this.setSeconds(sec + 60);
        }
    }

    /**
     * Sets the number of minutes
     *
     * @remarks
     * If the parameter is outside the (0-60) range, ```setSeconds()``` attempts
     * to update the Duration object accordingly
     *
     * @param min
     * @returns The number of minutes
     */
    public setMinutes(min: number): number {
        if (this._minutes >= 0 && this._seconds < 60) {
            return this._minutes;
        }
        if (this._minutes >= 60) {
            this._hours++;
            return this.setMinutes(min - 60);
        } else {
            this._hours--;
            return this.setMinutes(min + 60);
        }
    }

    public static formatDuration(minutes: number, seconds: number, hours?: number): string {
        let result = '';
        if (hours) {
            result += hours + ':';
        }
        result += minutes + ':';
        result += seconds;

        return result;
    }
}