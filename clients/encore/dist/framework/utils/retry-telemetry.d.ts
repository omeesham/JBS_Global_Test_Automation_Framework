export type RetryLayer = 'click' | 'login' | 'validateState' | 'radix' | 'expectPoll' | 'perTest';
export interface AttemptRecord {
    attemptN: number;
    durationMs: number;
    outcome: 'pass' | 'fail';
}
export interface PerLayerStats {
    callCount: number;
    totalAttempts: number;
    recoveredAtAttempt: Record<number, number>;
    wastedAttempts: number;
    wastedMs: number;
    succeededOnFirstAttempt: number;
    failedAfterAllAttempts: number;
}
export type RetryStats = Partial<Record<RetryLayer, PerLayerStats>>;
export declare function recordCall(layer: RetryLayer, attempts: AttemptRecord[]): void;
export declare function readAndAggregate(): RetryStats;
export declare function reset(): void;
