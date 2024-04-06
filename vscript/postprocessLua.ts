import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const copyrightPrefix = `--[[--------------------------------------------------------------------------------------------------------------

    Copyright (C) 2024 by Jaxswat, All rights reserved.

    No parts of this code or any of its contents may be reproduced, copied, modified or adapted,
    without the prior written consent of the author, unless otherwise indicated for stand-alone materials.

]]----------------------------------------------------------------------------------------------------------------
-- BioShock: Infinite for Steam VR Home
-- https://github.com/Jaxswat/BioShock-Infinite-Steam-VR
`;

const bundleTag = '____exports.__BundleAsGameScript = nil\n';

const plugin: tstl.Plugin = {
    beforeEmit(program: ts.Program, options: tstl.CompilerOptions, emitHost: tstl.EmitHost, result: tstl.EmitFile[]) {
        for (const file of result) {
            file.code = copyrightPrefix + file.code;

            const hasBundleTag = file.code.includes(bundleTag);
            if (hasBundleTag) {
                file.code = file.code.replace(bundleTag, '');
                file.code = file.code.replace('local ____exports = {}\n', '');
                file.code = file.code.replace(new RegExp(/____exports./, 'g'), '');
                file.code = file.code.replace('return ____exports\n', '');
            }
        }
    },
};

export default plugin;
