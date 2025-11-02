// This is the format for promiseAllSetter
export interface ErrorAllSetter {
	status: number;
	message: string;
}

export interface ResourceAllSetter<T> {
	success: boolean;
	resource?: T;
	error?: ErrorAllSetter;
}
