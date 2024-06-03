
//--- Module Types ---\\

declare module "config.json" {
	const config: {
		ccp_init: {
			ccpUrl: string;
			loginUrl: string;
			region: string;
		};
		api: {
			get_rtms: string;
		};
		version: string;
	};
	export default config;
}


//--- Utility Types ---\\

// Extracts the type of the arguments of the function F.
type ArgType<F extends (...any: any[]) => any> = F extends (...args: infer U) => any ? U : never;

// Extracts the type of the values of the object T.
type ValueOf<T> = T[keyof T];

declare module "@aspen-tgi/aspen-react";
