/**
 * Enums to handle play-dl errors in an easier way.
 */
 export enum Errors {
    /**
     * The video has age restrictions which require cookies to be bypassed.
     */
    AGE_RESTRICTED = 'While getting info from url\nSign in to confirm your age',
    /**
     * The video has been reported inappropriate by the community.
     */
    COMMUNITY_RESTRICTED = 'While getting info from url\nThe following content has been identified by the YouTube community as inappropriate or offensive to some audiences.',
    /**
     * When too many requests are sent and server rate limits you.
     */
    RATE_LIMITED = 'Got 429 from the request'
}