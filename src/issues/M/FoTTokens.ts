import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes, RegexIssue } from '../../types';
import { instanceFromSRC } from '../../utils';
import util from 'util';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.M,
  title: 'Contracts are vulnerable to fee-on-transfer and rebasing accounting-related issues',
  description:
    "Consistently check account balance before and after transfers for Fee-On-Transfer discrepancies. As arbitrary ERC20 tokens can be used, the amount here should be calculated every time to take into consideration a possible fee-on-transfer or deflation.\nAlso, it's a good practice for the future of the solution.\n\nUse the balance before and after the transfer to calculate the received amount instead of assuming that it would be equal to the amount passed as a parameter. Or explicitly document that such tokens shouldn't be used and won't be supported",
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];
    for (const file of files) {
      if (!!file.ast) {
        for (const a of findAll('FunctionCall', file.ast)) {
          if (
            a.expression &&
            (a.expression['memberName'] == 'transferFrom' ||
            a.expression['memberName'] == 'safeTransferFrom')
          ) {
            for (const b of findAll('Identifier', a)) {
              // Case of cast
              if (b.name.indexOf('ERC20') > -1) {
                const inst = instanceFromSRC(file, a.src);
                let str: string = inst.fileContent.split('\n')[inst.line - 1];
                const matches: any = [...str.matchAll(/address\(this/gi)];
                if (matches.length > 0) {
                  instances.push(inst);
                }
              }

              // Case of real type
              for (const c of findAll('VariableDeclaration', file.ast)) {
                if (b.name == c.name) {
                  for (const d of findAll('IdentifierPath', c)) {
                    if (d.name.indexOf('ERC20') > -1) {
                      const inst = instanceFromSRC(file, a.src);
                      let str: string = inst.fileContent.split('\n')[inst.line - 1];
                      const matches: any = [...str.matchAll(/address\(this/gi)];
                      if (matches.length > 0) {
                        instances.push(inst);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return instances;
  },
};

export default issue;
