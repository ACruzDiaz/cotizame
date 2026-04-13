import { QIStatus, QuoteStatus } from "../../generated/prisma/enums";

export enum Cmd {
  Cancel = "cancel",
  Complete = "complete",
  Assistance = "assistance",
}

export enum Flag {
  FirstCreate = "FirstCreate",
  Cancel = "Cancel",
  Complete = "Complete",
  Create = "Create",
}
export async function stateMachine(
  quoteStatus: QuoteStatus | null,
  quoteItemStatus: QIStatus | null,
  command: Cmd
): Promise<Flag> {
  if (!quoteStatus) return Flag.FirstCreate;
  switch (quoteStatus) {
    case QuoteStatus.pending:
      if (command === Cmd.Cancel) return Flag.Cancel;
      if (command === Cmd.Complete && quoteItemStatus === QIStatus.complete) {
        return Flag.Complete;
      }
      break;

    case QuoteStatus.closed:
    case QuoteStatus.complete:
      return Flag.Create;

    default:
      throw new Error("Invalid state");
  }

  throw new Error("Unhandled transition");
}
