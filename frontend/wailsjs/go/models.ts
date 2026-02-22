export namespace main {
	
	export class CommandRun {
	    id: number;
	    workspaceId: number;
	    toolName: string;
	    target: string;
	    args: string;
	    commandLine: string;
	    status: string;
	    exitCode: number;
	    startedAt: string;
	    completedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new CommandRun(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.workspaceId = source["workspaceId"];
	        this.toolName = source["toolName"];
	        this.target = source["target"];
	        this.args = source["args"];
	        this.commandLine = source["commandLine"];
	        this.status = source["status"];
	        this.exitCode = source["exitCode"];
	        this.startedAt = source["startedAt"];
	        this.completedAt = source["completedAt"];
	    }
	}
	export class ToolExample {
	    id: number;
	    toolName: string;
	    title: string;
	    description: string;
	    command: string;
	    sortOrder: number;
	
	    static createFrom(source: any = {}) {
	        return new ToolExample(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.toolName = source["toolName"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.command = source["command"];
	        this.sortOrder = source["sortOrder"];
	    }
	}
	export class ToolDocumentation {
	    documentation: string;
	    examples: ToolExample[];
	
	    static createFrom(source: any = {}) {
	        return new ToolDocumentation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.documentation = source["documentation"];
	        this.examples = this.convertValues(source["examples"], ToolExample);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Workspace {
	    id: number;
	    name: string;
	    description: string;
	    target: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Workspace(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.target = source["target"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}

}

export namespace tool {
	
	export class PrivilegeInfo {
	    elevated: boolean;
	    username: string;
	    os: string;
	
	    static createFrom(source: any = {}) {
	        return new PrivilegeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.elevated = source["elevated"];
	        this.username = source["username"];
	        this.os = source["os"];
	    }
	}
	export class StreamStartResult {
	    runId: number;
	    commandLine: string;
	
	    static createFrom(source: any = {}) {
	        return new StreamStartResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.runId = source["runId"];
	        this.commandLine = source["commandLine"];
	    }
	}
	export class ToolDef {
	    Name: string;
	    Category: string;
	    Binary: string;
	    DefaultArgs: string[];
	    NeedsRoot: boolean;
	    InstallHint: Record<string, string>;
	    VersionFlag: string;
	    Description: string;
	
	    static createFrom(source: any = {}) {
	        return new ToolDef(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Category = source["Category"];
	        this.Binary = source["Binary"];
	        this.DefaultArgs = source["DefaultArgs"];
	        this.NeedsRoot = source["NeedsRoot"];
	        this.InstallHint = source["InstallHint"];
	        this.VersionFlag = source["VersionFlag"];
	        this.Description = source["Description"];
	    }
	}
	export class ToolHealth {
	    name: string;
	    category: string;
	    installed: boolean;
	    version: string;
	    path: string;
	    needsRoot: boolean;
	    installHint: string;
	
	    static createFrom(source: any = {}) {
	        return new ToolHealth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.category = source["category"];
	        this.installed = source["installed"];
	        this.version = source["version"];
	        this.path = source["path"];
	        this.needsRoot = source["needsRoot"];
	        this.installHint = source["installHint"];
	    }
	}

}

