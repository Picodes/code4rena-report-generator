import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes, RegexIssue } from '../../types';
import { instanceFromSRC } from '../../utils';
import util from 'util';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.M,
  title: 'Library function isn\'t `internal` or `private`',
  description:
    'In a library, using an external or public visibility means that the function can only be accessed via `DELEGATECALL` on chain (in case the library is deployed on chain). This changes the context and should be done carefully. For Solidity libraries with internal functions, they are not deployed on chain and are executed with a jump instruction in the contract.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];
    for (const file of files) {
      if (!!file.ast) {
        for (const cd of findAll('ContractDefinition', file.ast)) {
          if (cd.contractKind != 'library') {
            continue;
          }
          for (const a of findAll('FunctionDefinition', file.ast)) {
            if (a.kind == 'constructor' || a.virtual) {
              continue;
            }
            if (
              a.visibility == "external" || a.visibility == "public") {
                instances.push(instanceFromSRC(file, a.src));
            }
          }
        }
      }
    }
    return instances;
  },
};

export default issue;
