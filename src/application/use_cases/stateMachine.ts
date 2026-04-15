import { QIStatus, QuoteStatus } from "../../generated/prisma/enums";
import { Intention, Flag } from "./state.types";

//Tienes que considerar el estado anterior. Para ello sera necesario persistir flag.
export async function stateMachine(
  quoteStatus: QuoteStatus | null,
  quoteItemStatus: QIStatus | null,
  command: Intention
): Promise<Flag> {
  if (!quoteStatus) return Flag.FirstCreate;
  switch (quoteStatus) {
    case QuoteStatus.pending:
      if (command === Intention.Cancel) return Flag.Cancel;
      if (command === Intention.Complete && quoteItemStatus === QIStatus.complete) {
        return Flag.Complete;
      }
      if(quoteItemStatus === QIStatus.complete && command === Intention.Quote)
        return Flag.Choosing
      if(quoteItemStatus === QIStatus.incomplete && command === Intention.Quote)
        return Flag.Quoting
      break;

    case QuoteStatus.closed:
    case QuoteStatus.complete:
      return Flag.Create;
    
    default:
      if(command === Intention.Invalid) return Flag.Invalid
      throw new Error("Invalid state");
  }

  throw new Error("Unhandled transition");
}
