import {printAST} from 'apollo-client'
import {HTTPFetchNetworkInterface, printRequest} from 'apollo-client/transport/networkInterface'

export default function createNetworkInterface(opts) {
    const {uri} = opts
    return new UploadNetworkInterface(uri, opts)
}

export class UploadNetworkInterface extends HTTPFetchNetworkInterface {

    fetchFromRemoteEndpoint(req) {
        const options = this.isUpload(req)
            ? this.getUploadOptions(req)
            : this.getJSONOptions(req)
        return fetch(this._uri, options);
    }

    isUpload({request}) {
        if (request.variables) {
            for (let key in request.variables) {
                if (request.variables[key] instanceof FileList) {
                    return true
                }
                if ((request.variables[key] instanceof Array) && (request.variables[key].length > 0)) {
                    return request.variables[key][0] instanceof File
                }
            }
        }
        return false
    }

    getJSONOptions({request, options}) {
        return Object.assign({}, this._opts, {
            body: JSON.stringify(printRequest(request)),
            method: 'POST',
        }, options, {
            headers: Object.assign({}, {
                Accept: '*/*',
                'Content-Type': 'application/json',
            }, options.headers),
        })
    }

    getUploadOptions({request, options}) {
        const body = new FormData();
        const variables = {};
        let fileCount = 0;
        const map = {};
        const file = [];

        for (let key in request.variables) {
            let v = request.variables[key]
            let list = null;
            if (v instanceof FileList) {
                list = Array.from(v);
            } else if (v instanceof Array && (v.length > 0) && v[0] instanceof File) {
                list = v;
            }
            if (list) {
                variables[key] = [];
                list.forEach((f, idx) => {
                    // body.append(key, f)
                    variables[key].push(null)
                    map[fileCount++] = [`variables.${key}.${idx}`];
                    file.push(f);
                });

            } else {
                variables[key] = v
            }
        }

        // body.append('operationName', request.operationName)
        // body.append('query', printAST(request.query))
        // body.append('variables', JSON.stringify(variables))

        body.append('operations', JSON.stringify({query: printAST(request.query), variables}));

        if (fileCount > 0) {
            body.append('map', JSON.stringify(map));
            file.forEach((f, idx) => body.append(`${idx}`, f));
        }


        return Object.assign({}, this._opts, {
            body,
            method: 'POST',
        }, options, {
            headers: Object.assign({}, {
                Accept: '*/*',
            }, options.headers),
        })
    }

}
