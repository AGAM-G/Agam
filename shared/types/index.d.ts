export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'dev' | 'tester';
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthResponse {
    token: string;
    user: User;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}
export declare enum TestType {
    API = "API",
    E2E = "E2E",
    LOAD = "LOAD",
    UI = "UI"
}
export declare enum TestStatus {
    PENDING = "pending",
    RUNNING = "running",
    PASSED = "passed",
    FAILED = "failed",
    SKIPPED = "skipped"
}
export interface TestCase {
    id: string;
    name: string;
    description: string;
    type: TestType;
    filePath: string;
    suite: string;
    status: TestStatus;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    modifiedAt: Date;
}
export interface TestFile {
    id: string;
    name: string;
    path: string;
    type: TestType;
    suite: string;
    status: TestStatus;
    modifiedAt: Date;
    testCases: TestCase[];
}
export interface TestRun {
    id: string;
    runId: string;
    name: string;
    status: TestStatus;
    duration: number;
    startedAt: Date;
    completedAt?: Date;
    testsPassed: number;
    testsFailed: number;
    testsPending: number;
    totalTests: number;
    userId: string;
    createdAt: Date;
}
export interface TestResult {
    id: string;
    testRunId: string;
    testCaseId: string;
    status: TestStatus;
    duration: number;
    error?: string;
    stackTrace?: string;
    screenshot?: string;
    logs?: string;
    startedAt: Date;
    completedAt?: Date;
}
export interface DashboardMetrics {
    totalTests: number;
    totalTestsChange: number;
    successRate: number;
    successRateChange: number;
    failedTests: number;
    failedTestsChange: number;
    avgDuration: number;
    avgDurationChange: number;
}
export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    testRunners: {
        active: number;
        total: number;
    };
    database: {
        available: number;
    };
    runningTests: number;
}
export interface ServerStatus {
    connected: boolean;
    lastChecked: Date;
}
export interface RecentTestRun {
    id: string;
    runId: string;
    name: string;
    duration: number;
    status: TestStatus;
    timeAgo: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface TestExecutionRequest {
    testCaseIds?: string[];
    testFileIds?: string[];
    type?: TestType;
    runAll?: boolean;
}
export interface TestExecutionProgress {
    runId: string;
    progress: number;
    currentTest: string;
    status: TestStatus;
    completedTests: number;
    totalTests: number;
}
//# sourceMappingURL=index.d.ts.map