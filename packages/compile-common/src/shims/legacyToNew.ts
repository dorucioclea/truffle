import { Bytecode, CompiledContract, LinkReference } from "../types";

export function shimContracts(contracts: any[]): CompiledContract[] {
  // convert to list
  return Object.values(contracts).map(shimContract);
}

export const shimContract = (contract: any): CompiledContract => {
  const {
    contractName,
    contract_name,
    sourcePath,
    source,
    sourceMap,
    deployedSourceMap,
    legacyAST,
    ast,
    abi,
    metadata,
    bytecode,
    deployedBytecode,
    compiler,
    devdoc,
    userdoc,
    immutableReferences
  } = contract;

  return {
    contractName: contract_name || contractName,
    sourcePath,
    source,
    sourceMap,
    deployedSourceMap,
    legacyAST,
    ast,
    abi,
    metadata,
    bytecode: shimBytecode(bytecode),
    deployedBytecode: shimBytecode(deployedBytecode),
    compiler,
    devdoc,
    userdoc,
    immutableReferences
  };
};

export function shimBytecode(bytecode: string): Bytecode {
  if (!bytecode) {
    return undefined;
  }
  if (typeof bytecode === "object") {
    return bytecode;
  }

  const linkReferences: LinkReference[] = [];

  const bytes = bytecode
    .slice(2) // remove 0x prefix
    .replace(/__[^_]+_*/g, (linkReference, characterOffset) => {
      const [, name] = linkReference.match(/__([^_]+)_*/);

      const characterLength = linkReference.length;

      const offset = characterOffset / 2;
      const length = characterLength / 2;

      linkReferences.push({
        offsets: [offset],
        name,
        length
      });

      return "0".repeat(characterLength);
    });

  return { bytes, linkReferences };
}
